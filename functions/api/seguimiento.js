const OFFICIAL = 'https://www.correos.cu/rastreador-de-envios/';
const ORIGIN = 'https://www.correos.cu';
const TOTAL_TIMEOUT_MS = 22000;

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
  .replace(/<\/p>|<\/div>|<\/li>|<\/tr>|<\/td>|<\/h\d>/gi, '\n')
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
    list.push({ name: attr(a, 'name'), type: attr(a, 'type').toLowerCase(), value: attr(a, 'value'), placeholder: attr(a, 'placeholder') });
  }
  for (const m of body.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi)) {
    const a = m[1];
    const selected = m[2].match(/<option\b[^>]*selected[^>]*value=["']([^"']*)["']/i) || m[2].match(/<option\b[^>]*value=["']([^"']*)["']/i);
    list.push({ name: attr(a, 'name'), type: 'select', value: selected ? selected[1] : '', placeholder: '' });
  }
  return list.filter(f => f.name);
}

function containsTrackingResult(html) {
  const t = strip(html).toUpperCase();
  const statuses = ['FACTURADO', 'CLASIFICADO', 'RECEPCIONADO', 'ENTREGADO A ADUANA', 'SALIDA ADUANA', 'PAQUETERÍA INTERNACIONAL', 'PAQUETERIA INTERNACIONAL'];
  const hits = statuses.filter(s => t.includes(s)).length;
  return hits >= 2 || (/PA[IÍ]S ORIGEN/.test(t) && hits >= 1);
}

function extractResult(html) {
  const text = strip(html);
  if (/no (se )?(encuentra|encontraron|existe)|sin informaci[oó]n|no ha sido procesado|no est[aá] registrado/i.test(text)) {
    return { ok: true, status: 'Sin información disponible', stage: 'Pendiente de registro', summary: 'El operador postal todavía no muestra información para este código.', events: [] };
  }

  const lines = text.split('\n').map(v => v.trim()).filter(Boolean);
  const events = [];
  const statusWords = /^(FACTURADO|CLASIFICADO|SALIDA ADUANA|ENTREGADO A ADUANA|RECEPCIONADO|RECIBIDO|EN CAMINO|EN ENTREGA|ENTREGADO|DESPACHADO|ARRIBO|ADUANA)$/i;
  const dateRe = /(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)?|\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?/i;

  for (let i = 0; i < lines.length; i++) {
    const clean = lines[i].replace(dateRe, '').trim();
    if (!statusWords.test(clean)) continue;
    const nearby = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 4));
    const joined = nearby.join(' · ');
    const date = (joined.match(dateRe) || [])[0] || '';
    const locationBits = nearby.filter(v => /^(En:|Hacia:)/i.test(v));
    if (!events.some(e => e.status === clean && e.date === date)) {
      events.push({ date, status: clean, location: locationBits.join(' · ') });
    }
  }

  let stage = 'En proceso';
  let status = 'Información localizada';
  if (/\bENTREGADO\b/i.test(text)) { stage = 'Entregado'; status = 'Envío entregado'; }
  else if (/EN ENTREGA/i.test(text)) { stage = 'En entrega'; status = 'En proceso de entrega'; }
  else if (/EN CAMINO|FACTURADO|DESPACHADO/i.test(text)) { stage = 'En camino'; status = 'Envío en camino'; }
  else if (/RECEPCIONADO|RECIBIDO|CLASIFICADO/i.test(text)) { stage = 'Recepción'; status = 'Envío recibido'; }

  const country = (text.match(/Pa[ií]s Origen:\s*([^\n]+)/i) || [])[1];
  return {
    ok: true,
    status,
    stage,
    summary: country ? `País de origen: ${country.trim()}` : 'Se encontraron movimientos registrados por el operador postal.',
    events: events.slice(0, 20)
  };
}

async function fetchText(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      ...options,
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'accept-language': 'es-ES,es;q=0.9,en;q=0.7',
        ...(options.headers || {})
      }
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
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
  return { params, codeSet };
}

async function submit(url, method, params, cookie) {
  if (method === 'GET') {
    const target = new URL(url);
    for (const [k, v] of params) target.searchParams.set(k, v);
    return fetchText(target.toString(), { headers: { referer: OFFICIAL, cookie } });
  }
  return fetchText(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest', referer: OFFICIAL, origin: ORIGIN, cookie },
    body: params.toString()
  });
}

async function doLookup(code, year) {
  const first = await fetchText(OFFICIAL, {}, 9000);
  if (!first.response.ok) throw new Error(`Página oficial respondió ${first.response.status}`);
  const cookie = cookiesFrom(first.response);

  const candidates = forms(first.text)
    .filter(f => /seguimiento|rastread|entre el c[oó]digo|año/i.test(f.full))
    .sort((a, b) => b.full.length - a.full.length)
    .slice(0, 2);

  for (const form of candidates) {
    const built = buildParams(form, code, year);
    if (!built.codeSet) continue;
    const action = attr(form.attrs, 'action') || OFFICIAL;
    const method = (attr(form.attrs, 'method') || 'POST').toUpperCase();
    const target = new URL(action, OFFICIAL).toString();
    const result = await submit(target, method, built.params, cookie);
    if (result.response.ok && containsTrackingResult(result.text)) return extractResult(result.text);
  }

  // Un único intento AJAX de compatibilidad; evita decenas de solicitudes que causaban la carga infinita.
  const params = new URLSearchParams({
    codigo: code,
    code,
    tracking: code,
    anio: year,
    ano: year,
    year,
    buscar: 'Buscar',
    submit: 'Buscar'
  });
  const ajax = await submit(OFFICIAL, 'POST', params, cookie);
  if (ajax.response.ok && containsTrackingResult(ajax.text)) return extractResult(ajax.text);

  return {
    ok: false,
    message: 'Correos de Cuba respondió, pero no entregó los movimientos al sistema automático. Intenta nuevamente o consulta con la tienda.'
  };
}

export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const code = (u.searchParams.get('codigo') || '').trim().toUpperCase();
  const year = (u.searchParams.get('anio') || new Date().getFullYear()).trim();
  if (!/^[A-Z0-9-]{6,40}$/.test(code)) return json({ ok: false, message: 'Número de rastreo inválido.' }, 400);

  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('total-timeout')), TOTAL_TIMEOUT_MS));
    const result = await Promise.race([doLookup(code, year), timeout]);
    return json(result, result.ok ? 200 : 502);
  } catch (error) {
    const timedOut = String(error?.message || '').includes('timeout') || error?.name === 'AbortError';
    return json({
      ok: false,
      message: timedOut
        ? 'El sistema oficial tardó demasiado en responder. La consulta fue detenida para evitar que la página se quede cargando.'
        : 'No fue posible conectar con el sistema oficial de Correos de Cuba en este momento.'
    }, 504);
  }
}
