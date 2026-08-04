const OFFICIAL = 'https://www.correos.cu/rastreador-de-envios/';
const ORIGIN = 'https://www.correos.cu';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=UTF-8',
    'cache-control': 'no-store, max-age=0',
    'x-content-type-options': 'nosniff'
  }
});

const decode = (s = '') => s
  .replace(/&nbsp;/gi, ' ')
  .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é')
  .replace(/&iacute;/gi, 'í').replace(/&oacute;/gi, 'ó')
  .replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
  .replace(/&quot;/gi, '"').replace(/&#039;|&apos;/gi, "'")
  .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');

const strip = (s = '') => decode(s)
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/p>|<\/div>|<\/li>|<\/tr>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s*\n+/g, '\n')
  .trim();

const attr = (tag, name) => {
  const m = String(tag).match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decode(m[1]) : '';
};

function cookiesFrom(response) {
  const raw = response.headers.get('set-cookie') || '';
  return raw.split(/,(?=[^;,]+=)/).map(v => v.split(';')[0].trim()).filter(Boolean).join('; ');
}

function forms(html) {
  return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)]
    .map(m => ({ attrs: m[1], body: m[2], full: m[0] }));
}

function fields(body) {
  const list = [];
  for (const m of body.matchAll(/<input\b([^>]*)>/gi)) {
    const a = m[1];
    list.push({ tag: 'input', name: attr(a, 'name'), type: attr(a, 'type').toLowerCase(), value: attr(a, 'value'), placeholder: attr(a, 'placeholder') });
  }
  for (const m of body.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi)) {
    const a = m[1];
    const selected = m[2].match(/<option\b[^>]*selected[^>]*value=["']([^"']*)["']/i) || m[2].match(/<option\b[^>]*value=["']([^"']*)["']/i);
    list.push({ tag: 'select', name: attr(a, 'name'), type: 'select', value: selected ? selected[1] : '', placeholder: '' });
  }
  return list.filter(f => f.name);
}

function looksLikeResult(html, code) {
  const t = strip(html).toUpperCase();
  return t.includes(code.toUpperCase()) && /(FACTURADO|CLASIFICADO|RECEPCIONADO|ADUANA|ENTREGADO|EN CAMINO|PAQUETER[IÍ]A INTERNACIONAL|PA[IÍ]S ORIGEN)/i.test(t);
}

function extractResult(html, code) {
  const text = strip(html);
  const upper = text.toUpperCase();
  const pos = upper.indexOf(code.toUpperCase());
  const segment = pos >= 0 ? text.slice(Math.max(0, pos - 500), Math.min(text.length, pos + 7000)) : text;

  if (/no (se )?(encuentra|encontraron|existe)|sin informaci[oó]n|no ha sido procesado|no est[aá] registrado/i.test(segment)) {
    return { ok: true, status: 'Sin información disponible', stage: 'Pendiente de registro', summary: 'El operador postal todavía no muestra información para este código.', events: [] };
  }

  const lines = segment.split('\n').map(v => v.trim()).filter(Boolean);
  const events = [];
  const statusWords = /(FACTURADO|CLASIFICADO|SALIDA ADUANA|ENTREGADO A ADUANA|RECEPCIONADO|RECIBIDO|EN CAMINO|EN ENTREGA|ENTREGADO|DESPACHADO|ARRIBO|ADUANA)/i;
  const dateRe = /(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?|\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/i;

  for (let i = 0; i < lines.length; i++) {
    if (!statusWords.test(lines[i])) continue;
    const block = [lines[i - 1], lines[i], lines[i + 1], lines[i + 2]].filter(Boolean).join(' · ');
    const date = (block.match(dateRe) || [])[0] || '';
    const status = lines[i].replace(dateRe, '').trim();
    const locationBits = [lines[i + 1], lines[i + 2]].filter(v => v && /^(En:|Hacia:)/i.test(v));
    if (status && !events.some(e => e.status === status && e.date === date)) {
      events.push({ date, status, location: locationBits.join(' · ') });
    }
  }

  let stage = 'En proceso';
  let status = 'Información localizada';
  if (/\bENTREGADO\b/i.test(segment)) { stage = 'Entregado'; status = 'Envío entregado'; }
  else if (/EN ENTREGA/i.test(segment)) { stage = 'En entrega'; status = 'En proceso de entrega'; }
  else if (/EN CAMINO|FACTURADO|DESPACHADO/i.test(segment)) { stage = 'En camino'; status = 'Envío en camino'; }
  else if (/RECEPCIONADO|RECIBIDO|CLASIFICADO/i.test(segment)) { stage = 'Recepción'; status = 'Envío recibido'; }

  const country = (segment.match(/Pa[ií]s Origen:\s*([^\n]+)/i) || [])[1];
  return {
    ok: true,
    status,
    stage,
    summary: country ? `País de origen: ${country.trim()}` : 'Se encontraron movimientos registrados por el operador postal.',
    events: events.slice(0, 20)
  };
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      'accept-language': 'es-ES,es;q=0.9,en;q=0.7',
      ...(options.headers || {})
    }
  });
  return { response, text: await response.text() };
}

function buildParams(form, code, year) {
  const params = new URLSearchParams();
  let codeSet = false, yearSet = false;
  for (const f of fields(form.body)) {
    const hint = `${f.name} ${f.placeholder}`.toLowerCase();
    if (!codeSet && /seguimiento|rastreo|tracking|c[oó]digo|codigo|env[ií]o|guia/.test(hint)) {
      params.set(f.name, code); codeSet = true;
    } else if (!yearSet && /año|ano|year|ejercicio/.test(hint)) {
      params.set(f.name, year); yearSet = true;
    } else if (f.type === 'hidden' || f.value) {
      params.set(f.name, f.value);
    }
  }
  return { params, codeSet, yearSet };
}

async function submit(url, method, params, cookie) {
  if (method === 'GET') {
    const target = new URL(url);
    for (const [k, v] of params) target.searchParams.set(k, v);
    return fetchText(target.toString(), { headers: { referer: OFFICIAL, cookie } });
  }
  return fetchText(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest', referer: OFFICIAL, cookie },
    body: params.toString()
  });
}

export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const code = (u.searchParams.get('codigo') || '').trim().toUpperCase();
  const year = (u.searchParams.get('anio') || new Date().getFullYear()).trim();
  if (!/^[A-Z0-9-]{6,40}$/.test(code)) return json({ ok: false, message: 'Número de rastreo inválido.' }, 400);

  try {
    const first = await fetchText(OFFICIAL);
    if (!first.response.ok) throw new Error(`Página oficial respondió ${first.response.status}`);
    const cookie = cookiesFrom(first.response);
    if (looksLikeResult(first.text, code)) return json(extractResult(first.text, code));

    // 1) Enviar el formulario real localizado en la página.
    const candidates = forms(first.text)
      .filter(f => /seguimiento|rastread|c[oó]digo|codigo|entre el c[oó]digo/i.test(f.full))
      .sort((a, b) => b.full.length - a.full.length);

    for (const form of candidates) {
      const built = buildParams(form, code, year);
      if (!built.codeSet) continue;
      const action = attr(form.attrs, 'action') || OFFICIAL;
      const method = (attr(form.attrs, 'method') || 'POST').toUpperCase();
      const target = new URL(action, OFFICIAL).toString();
      const result = await submit(target, method, built.params, cookie);
      if (result.response.ok && looksLikeResult(result.text, code)) return json(extractResult(result.text, code));
    }

    // 2) Compatibilidad con variantes AJAX / WordPress usadas por el rastreador.
    const endpoints = [
      OFFICIAL,
      `${ORIGIN}/wp-admin/admin-ajax.php`
    ];
    const codeNames = ['codigo', 'code', 'tracking', 'seguimiento', 'numero', 'envio', 'guia'];
    const yearNames = ['anio', 'ano', 'year'];
    const actions = ['', 'rastreador_envios', 'rastrear_envio', 'buscar_envio', 'tracking_envio', 'consulta_envio'];

    for (const endpoint of endpoints) {
      for (const action of actions) {
        for (const codeName of codeNames) {
          const p = new URLSearchParams();
          p.set(codeName, code);
          p.set(yearNames[0], year);
          p.set(yearNames[1], year);
          p.set(yearNames[2], year);
          p.set('buscar', 'Buscar');
          p.set('submit', 'Buscar');
          if (action) p.set('action', action);
          const result = await submit(endpoint, 'POST', p, cookie);
          if (result.response.ok && looksLikeResult(result.text, code)) return json(extractResult(result.text, code));
        }
      }
    }

    return json({
      ok: false,
      message: 'Correos de Cuba respondió, pero no permitió obtener el resultado automáticamente. Estamos ajustando la conexión con su rastreador.'
    }, 502);
  } catch (error) {
    return json({
      ok: false,
      message: 'No fue posible conectar con el sistema oficial de Correos de Cuba en este momento.'
    }, 502);
  }
}
