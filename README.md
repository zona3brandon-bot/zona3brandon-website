# Zona 3B Brandon v6.5

Actualización lista para GitHub y Cloudflare Pages.

## Cambios
- Días de salida: marítimo lunes/miércoles/viernes; aéreo martes/viernes; express lunes/viernes.
- Calculadora muestra automáticamente los días de salida.
- Tiempos de entrega del servicio presencial de dinero.
- Página detallada con destinos y días especiales de entrega.
- Los destinos sin día indicado muestran “Confirmar en tienda”.

Sube todos los archivos a la raíz del repositorio reemplazando los anteriores.


## Versión 6.6 — Seguimiento
- Nueva página `seguimiento.html`.
- Función de Cloudflare Pages en `functions/api/seguimiento.js`.
- La función consulta el rastreador oficial y devuelve solamente el estado procesado a la página de Zona 3B.
- Para que el seguimiento funcione, despliegue el repositorio como Cloudflare Pages incluyendo la carpeta `functions`. GitHub Pages por sí solo no ejecuta la función.
- La disponibilidad depende del sitio oficial de Correos de Cuba y puede cambiar si dicho sitio modifica su formulario.

## v6.7 — Corrección de pestaña Seguimiento
- El enlace de seguimiento ahora aparece como **RASTREO** en el menú principal de todas las páginas.
- Estilo destacado para facilitar su localización.
- Menú compactado para evitar que el enlace quede fuera de pantalla.
- Archivos CSS y JavaScript versionados para evitar caché antigua de Cloudflare.

## v6.8 — Corrección del rastreo
- Nueva función de Cloudflare con conservación de cookies/sesión.
- Detección del formulario dinámico y compatibilidad con consultas AJAX.
- Analizador mejorado de movimientos, fechas, ubicaciones y país de origen.
- Archivo de rastreo versionado para evitar caché anterior.


## v6.9
- Evita la carga infinita del seguimiento.
- Tiempo máximo de consulta en navegador: 30 segundos.
- Tiempo máximo de función: 22 segundos.
- Reconoce movimientos aunque la respuesta oficial no repita el código de rastreo.
- Reduce los intentos externos para evitar el timeout de Cloudflare.
