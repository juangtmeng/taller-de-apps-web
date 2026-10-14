# Taller de Apps · sitio web

Sitio estático: HTML, CSS y JS sin dependencias ni build. Ocho páginas: el inicio y una por rubro. Todo el sitio repite la misma idea: cada herramienta se hace a medida, sobre cómo trabaja hoy cada negocio.

| Archivo | Qué es | URL en Vercel |
|---|---|---|
| `index.html` | Página principal: qué hacemos, dolores, 4 pasos (el primero con un proceso dibujado de ejemplo), para quién, compromisos, preguntas, quién soy, contacto | `/` |
| `talleres.html` | Talleres mecánicos | `/talleres` |
| `servicios-tecnicos.html` | Refrigeración, climatización, seguridad electrónica, piscinas | `/servicios-tecnicos` |
| `corralones.html` | Corralones, ferreterías y distribuidoras con reparto | `/corralones` |
| `turnos.html` | Negocios con turnos: veterinarias, estética, consultorios, gimnasios | `/turnos` |
| `comida.html` | Locales de comida que toman pedidos: rotiserías, pizzerías, viandas | `/comida` |
| `profesionales.html` | Estudios contables y jurídicos, inmobiliarias, arquitectura, empresas de servicios | `/profesionales` |
| `transporte.html` | Fletes, mudanzas, cargas | `/transporte` |

La página de organizaciones se sacó por ahora: `_redirects` manda `/organizaciones` al inicio, así que si el archivo `organizaciones.html` sigue en GitHub no molesta (se puede borrar).

Las cuatro últimas landings se generan con `make-landings.py` a partir de `landings_data.py` (herramientas aparte). Para cambiar un texto de esas páginas, conviene cambiarlo ahí y volver a generar; si se edita el HTML a mano, el próximo generado lo pisa.

## Datos en `assets/site.js`

```js
var WHATSAPP = "5493518508990";                 // ya está cargado
var DEMO_URL = "https://REEMPLAZAR-POR-LA-URL-DE-LA-DEMO"; // ← poner la URL de la orden digital cuando esté publicada
```

Todos los botones "Escribime por WhatsApp" arman solos el link `wa.me` con un mensaje prellenado distinto por página (atributo `data-wa` en cada botón). Todos los botones "Ver la demo" apuntan a `DEMO_URL`; **mientras `DEMO_URL` siga diciendo REEMPLAZAR, esos botones no se muestran**, así que la web se puede publicar antes que la demo.

## Link personalizado para cada negocio

El link que mandás puede llevar el nombre del negocio, el nombre de la persona a quien saludás, su localidad, su id de cuenta en Airtable, la versión del mensaje y el canal por el que lo mandaste:

```
https://taller-de-apps.pages.dev/talleres?para=Taller%20Ruta%2053&nombre=Marcela&zona=R%C3%ADo%20Ceballos&c=recAbCdEfGhIjKlMn&m=2&origen=instagram
```

Con ese link, `site.js`:

- muestra arriba un saludo ("**Hola, Marcela.** Aquí te comparto info de mi servicio para Taller Ruta 53. Lo que ves aquí es un ejemplo, la App se arma a medida de acuerdo a su propio proceso."). Sin `nombre` dice solo "Hola.";
- cambia el mensaje de todos los botones de WhatsApp a "Hola Juan, soy Marcela, de Taller Ruta 53 (Río Ceballos). Vi la página que me mandaste…", así sabés quién escribe aunque sea desde otro número;
- mantiene el saludo si la persona pasa a otra página del sitio.

Sin `para`, o con un valor raro (más de 80 letras, vacío), la página se ve igual que siempre. Si `nombre` trae algo que no sea un nombre (números, signos), saluda sin nombre. El nombre de la persona solo se muestra en pantalla: no se manda a Airtable. Lo que viene en el link se muestra como texto, nunca como código. El link no se puede proteger: cualquiera podría armar uno con otro nombre, pero solo cambia ese saludo.

Los links se arman solos en Airtable con el campo "Link para mandar" de cada cuenta (ver `claude/web/cloudflare-y-visitas.md` en el proyecto).

## Registro de visitas (sin cookies)

Cada visita queda como **una fila en Airtable**, que se va completando mientras la persona navega:

- **De tus links personalizados** → base del CRM, tabla **Visitas web**, vinculada a la cuenta. Se anota apenas abren el link.
- **Del resto** → base aparte **Visitas · Taller de Apps**, tabla **Visitas**. Se anota al salir o cambiar de app.

Qué se anota: de dónde llegó (link personalizado, Google, Instagram, Facebook, LinkedIn, WhatsApp, QR / impreso, directo), qué páginas miró, si llegó al proceso dibujado, si tocó WhatsApp, si era celular o computadora, la localidad aproximada (sale de la conexión; desde el celular suele decir Córdoba) y cuántos segundos estuvo.

Qué **no** se anota: cookies, la IP, datos del celular, quién es la persona. No se puede saber el LinkedIn o el Instagram de alguien que entra: solo lo sabés si le mandaste vos el link (por WhatsApp, Instagram o LinkedIn) o si te escribe. El pie de todas las páginas lo dice.

Cómo funciona: `assets/site.js` arma el resumen de la visita y lo manda a `/api/visita`, una función de Cloudflare (`functions/api/visita.js`) que lo escribe en Airtable con el token guardado en Cloudflare. El token nunca está en la página. Robots y vistas previas de links no se anotan.

Para que tus propias visitas no cuenten: abrí una vez `https://taller-de-apps.pages.dev/?soy=juan` en tu celular y en tu computadora (`?soy=otro` lo deshace).

Límite: el plan gratis de Airtable da 1.000 llamadas por mes. Cada página vista usa una, así que alcanza para unas 300 a 400 visitas por mes. Si un mes se pasa, Airtable deja de anotar hasta el mes siguiente y el panel de Cloudflare sigue contando.

**Links cortos para impresos:** en `_redirects` hay ejemplos (`/qr`, `/tarjeta`, `/maps`, `/ig`) que llevan a la página con `?origen=` marcado. Se activan quitando el `#`.

## Señales de intención (qué miró cada visita)

Además de páginas, proceso y WhatsApp, cada visita anota:

- **Secciones vistas:** las que quedaron al menos 1,2 segundos en el centro de la pantalla (pasar de largo no cuenta). Ejemplo: "Talleres mecánicos › Proceso dibujado", "Inicio › Cómo cobro".
- **Preguntas abiertas:** las preguntas frecuentes que desplegó.
- **Miró precios:** vio la sección **Cómo cobro** (inicio, `#cobro`), abrió "¿Cuánto sale?" o tocó "¿Cuánto saldría para mi negocio?".
- **Pidió precio:** tocó el botón "¿Cuánto saldría para mi negocio?" (`data-precio`), que abre WhatsApp con ese pedido.

En el CRM, cuatro automatizaciones convierten esto en señales con puntos (una vez por cuenta): miró precios +8, volvió o compartió +6, tocó WhatsApp +4, abrió y vio el proceso +3. Detalle en `claude/agentes/senales-e-intencion.md` del proyecto.

## Publicar en Cloudflare Pages

El sitio vive en Cloudflare Pages (plan gratis, permitido para uso comercial), conectado al mismo repo de GitHub. Cada vez que subís archivos al repo, Cloudflare publica solo.

1. En Cloudflare: **Workers & Pages → Create → Pages → Import an existing Git repository** → elegí el repo. Nombre del proyecto: `taller-de-apps`. Framework: *None*. Sin comando de build, carpeta de salida vacía.
2. **Settings → Variables and Secrets**: `AIRTABLE_TOKEN` (tipo *Secret*) y `AIRTABLE_BASE_VISITAS` (el id de la base de visitas, empieza con `app`).
3. **Metrics → Web Analytics → Enable**: panel gratis con visitas, páginas y de dónde llegan.

Archivos propios de Cloudflare: `_redirects` (redirecciones y links cortos), `_headers` (las tipografías se guardan un año) y `functions/` (el registro de visitas). Las URLs salen sin `.html` (`/talleres`) sin configurar nada.

`vercel.json` ahora solo manda todo de Vercel a Cloudflare, para que los links viejos sigan andando. Cuando ya nadie use la dirección vieja, el proyecto de Vercel se puede borrar.

`styles.css` y `site.js` se piden con un número de versión (`styles.css?v=20261014h`): **si los cambiás, subí ese número en las 8 páginas** (o en `brand.py` si usás el generador), así los navegadores no siguen mostrando la copia vieja.

## Dónde se cambia cada cosa

| Quiero cambiar… | Dónde |
|---|---|
| Textos de una página | El `.html` correspondiente. Los textos están en el orden en que se leen. |
| Colores, tipografías, tamaños | `assets/styles.css`, bloque `:root` al principio. |
| Logo | El ícono está como SVG en el encabezado y el pie de cada página; los íconos del navegador y del celular en `assets/` (ver "Marca"). |
| Mensaje de WhatsApp de un botón | Atributo `data-wa="…"` de ese botón. |
| Imágenes para compartir por WhatsApp | `assets/img/mockup-*.png` (los dos celulares de cada rubro) y `assets/img/og-*.png` (la vista previa del link de cada página). Se regeneran con `render-mockups.py` (herramienta aparte, no hace falta subirla). |
| Años de experiencia, zona, teléfono | Buscá "más de 12 años", "Unquillo" y "850 8990" en los `.html`. |
| Diagramas de proceso ("Tu proceso, dibujado tal como es") | Son SVG dentro de cada página, uno de ejemplo por rubro. Se generan con `bpmn.py` (herramienta aparte): los carriles son las personas, las cajas los pasos y los puntos de cobre marcan dónde algo se anota dos veces, se pierde o alguien tiene que preguntar. |

## Marca

Todo sigue el **Manual de marca v1** de Taller de Apps (hecho con Claude Design, 2026-10-14).

- **Ícono:** la regla (un celular de costado que también es una regla). En el encabezado va como SVG dentro del HTML, en verde, y hereda el color; en el pie va en crema sobre tinta. En celular, el encabezado muestra solo el ícono.
- **Nombre:** siempre "Taller de Apps", en Archivo 800 con interletrado −2,5 %.
- **Lema** (en el pie de todas las páginas): "Hecho a tu medida. Lo ves andar antes de pagar."
- **Colores** (bloque `:root` de `styles.css`): crema `#F3EDE2` (fondo), tinta `#1E1B18` (texto y fondos oscuros), verde sierra `#1F6B4A` (botones, enlaces, ícono) y cobre `#C2653A` (subrayados y numeración; nunca en botones ni en texto chico). Tonos de apoyo: `#4A453E`, `#6B655C`, `#DDD6CA`, `#175338`.
- **Íconos del sitio:** `assets/favicon.svg` (versión de 3 marcas), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (fondo verde, sin redondear), `android-chrome-192.png` e `icono-512.png` (para `site.webmanifest`).
- Las demás piezas (logo horizontal y apilado, foto de perfil de WhatsApp, imagen para compartir) están en el kit de Claude Design.

## Tipografías

Una sola: **Archivo** (pesos 400, 500, 600 y 800), servida desde `assets/fonts/` con su licencia Open Font License. Títulos 800, subtítulos 600, texto 400, etiquetas 500 en mayúsculas. No hay pedidos a Google Fonts ni a ningún tercero: el sitio no envía datos de los visitantes a nadie.

## Lo que no tiene a propósito

- Precios: no hay lista de precios (decisión del servicio). Las páginas explican que el precio sale por etapas, después del documento del proceso.
- Formulario de contacto: el canal es WhatsApp. Un formulario necesitaría backend y sería otro lugar donde responder.
- Seguimiento con cookies, píxeles de redes o identificación de personas: no hay. El registro de visitas es anónimo salvo los links que mandás vos (ver arriba).
