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
