# Taller de Apps · sitio web

Sitio estático: HTML, CSS y JS sin dependencias ni build. Nueve páginas: el inicio y una por rubro.

| Archivo | Qué es | URL en Vercel |
|---|---|---|
| `index.html` | Página principal: qué hacemos, dolores, 4 pasos, para quién, compromisos, preguntas, quién soy, contacto | `/` |
| `talleres.html` | Talleres mecánicos | `/talleres` |
| `servicios-tecnicos.html` | Refrigeración, climatización, seguridad electrónica, piscinas | `/servicios-tecnicos` |
| `corralones.html` | Corralones, ferreterías y distribuidoras con reparto | `/corralones` |
| `turnos.html` | Negocios con turnos: veterinarias, estética, consultorios, gimnasios | `/turnos` |
| `comida.html` | Locales de comida que toman pedidos: rotiserías, pizzerías, viandas | `/comida` |
| `profesionales.html` | Estudios contables y jurídicos, inmobiliarias, arquitectura, empresas de servicios | `/profesionales` |
| `transporte.html` | Fletes, mudanzas, cargas | `/transporte` |
| `organizaciones.html` | Cooperativas de servicios, clubes, fundaciones, asociaciones | `/organizaciones` |

Las cinco últimas landings se generan con `make-landings.py` a partir de `landings_data.py` (herramientas aparte). Para cambiar un texto de esas páginas, conviene cambiarlo ahí y volver a generar; si se edita el HTML a mano, el próximo generado lo pisa.

## Datos en `assets/site.js`

```js
var WHATSAPP = "5493518508990";                 // ya está cargado
var DEMO_URL = "https://REEMPLAZAR-POR-LA-URL-DE-LA-DEMO"; // ← poner la URL de la orden digital cuando esté publicada
```

Todos los botones "Escribime por WhatsApp" arman solos el link `wa.me` con un mensaje prellenado distinto por página (atributo `data-wa` en cada botón). Todos los botones "Ver la demo" apuntan a `DEMO_URL`; **mientras `DEMO_URL` siga diciendo REEMPLAZAR, esos botones no se muestran**, así que la web se puede publicar antes que la demo.

## Publicar en Vercel (2 minutos)

1. Subí esta carpeta a un repo de GitHub (por ejemplo `taller-de-apps-web`).
2. En Vercel: **Add New → Project → Import** ese repo. Framework: *Other*. Sin comando de build. Deploy.
3. Queda en `https://<nombre>.vercel.app`. Cuando tengas dominio propio, se agrega en *Settings → Domains*.

`vercel.json` hace que las URLs salgan sin `.html` (`/talleres`) y que los archivos de `assets/` se guarden en caché una semana.

## Dónde se cambia cada cosa

| Quiero cambiar… | Dónde |
|---|---|
| Textos de una página | El `.html` correspondiente. Los textos están en el orden en que se leen. |
| Colores, tipografías, tamaños | `assets/styles.css`, bloque `:root` al principio. |
| Logo | Provisorio: `assets/favicon.svg` y `assets/apple-touch-icon.png` (ver "Logo (provisorio)"). |
| Mensaje de WhatsApp de un botón | Atributo `data-wa="…"` de ese botón. |
| Imágenes para compartir por WhatsApp | `assets/img/mockup-*.png` (los dos celulares de cada rubro) y `assets/img/og-*.png` (la vista previa del link de cada página). Se regeneran con `render-mockups.py` (herramienta aparte, no hace falta subirla). |
| Años de experiencia, zona, teléfono | Buscá "Más de 10 años", "Unquillo" y "850 8990" en los `.html`. |

## Logo (provisorio)

Mientras se define el logo con Claude Design, la web usa solo el nombre escrito ("Taller de Apps" en Barlow Condensed, arriba a la izquierda) y una **T** blanca sobre fondo tinta en la pestaña (`assets/favicon.svg`) y en el iPhone (`assets/apple-touch-icon.png`).

Cuando llegue el logo definitivo: se reemplazan esos dos archivos, se agrega el ícono al lado del nombre en el encabezado de las 4 páginas y, si trae paleta nueva, se cambian los colores del bloque `:root` de `styles.css`.

## Tipografías

Barlow, Barlow Condensed e IBM Plex Mono se sirven desde `assets/fonts/` (licencia Open Font License, incluida). No hay pedidos a Google Fonts ni a ningún tercero: el sitio no envía datos de los visitantes a nadie.

## Lo que no tiene a propósito

- Precios: no hay lista de precios (decisión del servicio). Las páginas explican que el precio sale por etapas, después del documento del proceso.
- Formulario de contacto: el canal es WhatsApp. Un formulario necesitaría backend y sería otro lugar donde responder.
- Analítica: no hay seguimiento de visitantes. Si más adelante querés medir, Vercel Analytics se activa desde el panel sin tocar el código.
