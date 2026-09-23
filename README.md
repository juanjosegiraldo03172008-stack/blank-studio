# VALENCIANO

Sitio web de VALENCIANO — ropa esencial en 100% algodón peruano, con una estética elegante e italiana. Construido con Next.js, TypeScript y Tailwind CSS.

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Qué archivos editar según lo que quieras cambiar

| Quiero cambiar... | Archivo |
| --- | --- |
| Precios (por escala de cantidad) | `src/data/pricing.ts` |
| Colores, tallas, medidas, descripciones de producto | `src/data/products.ts` |
| Usuario de Instagram (canal de soporte) | `src/lib/instagramOrder.ts` |
| Textos de la home | `src/app/page.tsx` |
| Textos de "La marca" | `src/app/marca/page.tsx` |

## Cómo subir fotografía real de producto

Cada producto busca automáticamente sus fotos en:

```
/public/products/<slug-del-producto>/<color>-1.jpg
/public/products/<slug-del-producto>/<color>-2.jpg
/public/products/<slug-del-producto>/<color>-3.jpg
```

Por ejemplo, para Essentials 200 en negro: `/public/products/essentials-200/negro-1.jpg`.

Los slugs son: `essentials-200`, `essentials-300`, `oversize-200`, `oversize-300`.
Los ids de color están en `src/data/products.ts` (ej: `negro`, `blanco`, `beige`, `azul-navy`, etc).

Mientras no exista la foto de un color, el sitio muestra automáticamente
una vista previa de estudio (silueta + color real) — no rompe nada, y en
cuanto sueltas la foto real con el nombre correcto, se reemplaza sola.

## Logo

El logo definitivo de VALENCIANO (el monograma "AV" en blanco sobre negro)
todavía no está integrado — súbelo como archivo (no lo pegues en el chat)
para que quede en el repo, y se puede colocar en el header, footer y favicon.
Mientras tanto, `BrandMark` muestra una "V" tipográfica de reemplazo.

## Pedidos

Existe una sola ruta de compra (P0-A), **sin pasarela de pago**, con el
envío cotizado manualmente antes de pagar (P0-B3):

carrito → `/pedido` (datos + modalidad: entrega en dirección o recogida en
oficina + transportadora preferida opcional) → "Solicitar cotización de
envío" → se crea el pedido como solicitud (`quote_status = pending`, sin
pago) → VALENCIANO cotiza con una tarifa real (`npm run admin:quote`) →
`/pedido/[id]` muestra prendas + envío + total → el cliente acepta
(`accepted`) → recién ahí aparecen los datos de Nequi/Bancolombia → reporta
la transferencia (`payment_reported`) → VALENCIANO verifica el ingreso →
`paid` (solo manual). Las prendas se pagan por transferencia; el envío, a la
transportadora al recibir.

El cliente también puede responder "No acepto este valor" (`rejected`, el
pedido sigue vivo), "Solicitar otra opción de envío" (vuelve a `pending`) o
"Cancelar solicitud" (única acción que cancela; no disponible después de
aceptar). Cada cotización vale 48 horas; los pedidos anteriores a P0-B3
(`quote_status` NULL) conservan el flujo original.

Instagram (`@valenciano.co`, en `src/lib/instagramOrder.ts`) queda solo
como canal de soporte: enlaces de ayuda y envío **opcional** del
comprobante de transferencia desde `/pedido/[id]`. Ver la siguiente
sección para configurar la base de datos.

## Base de datos (pedidos, FASE 4A)

`src/data/products.ts` sigue siendo la fuente de verdad del catálogo
(producto, precio, colores, tallas). La base de datos PostgreSQL solo
guarda pedidos, sus items (snapshot al momento de la compra) e inventario
básico — no reemplaza el catálogo.

**Configurar en desarrollo:**

1. Copia `.env.example` a `.env.local` y ajusta `DATABASE_URL` con tu
   Postgres local o de prueba (`.env.local` está en `.gitignore`, nunca se
   sube).
2. Ejecuta las migraciones:
   ```bash
   npm run db:migrate
   ```
   Esto crea/actualiza las tablas `orders`, `order_items`, `inventory` de
   forma versionada (lee `db/migrations/*.sql` en orden, cada una dentro de
   su propia transacción, y registra cuáles ya se aplicaron en
   `schema_migrations` — nunca hace `push` destructivo de schema).

**Configurar en Vercel (producción/preview):** agrega `DATABASE_URL` en
Project Settings → Environment Variables, apuntando a tu proveedor de
PostgreSQL administrado. Corre `npm run db:migrate` (con esa misma
`DATABASE_URL` en el entorno) antes de cada deploy que incluya una
migración nueva.

**Crear un pedido de prueba, sin pago:** con el servidor de desarrollo
corriendo (`npm run dev`) y un producto en el carrito, visita
`/dev/crear-pedido-prueba` — es una herramienta interna, no enlazada desde
ninguna navegación, y devuelve 404 en producción (`npm run build && npm run
start`). Llama al mismo Server Action (`src/app/actions/orders.ts`) que usa
el checkout real (`/pedido`).

**Reglas que ya aplica el servidor** (ver `src/lib/orders/`):

- Precio, nombre y disponibilidad de color/talla se recalculan siempre
  desde `products.ts` — el navegador nunca puede fijar un precio o total.
- El envío se paga al recibir (`shipping_payment_method:
  cash_on_delivery` — solo el envío, las prendas se pagan por
  transferencia) — nunca se suma un costo de envío al subtotal.
- Reenviar la misma solicitud (mismo `idempotencyKey`) devuelve el pedido
  ya creado en vez de duplicarlo.
- El pedido y sus items se crean en una sola transacción — si falla algo,
  no queda un pedido a medias.
- P0-B3: no se puede reportar pago de un pedido cuyo total no fue aceptado,
  y los datos bancarios no llegan al navegador antes de aceptar. Aceptar,
  rechazar, pedir otra opción y cancelar son idempotentes y rechazan
  versiones viejas o cotizaciones vencidas.

## Operación de cotizaciones de envío (P0-B3)

Se ejecutan desde un entorno seguro (p. ej. Codespaces) con `DATABASE_URL`
como secret — nunca escrita en el repositorio ni en archivos versionados.
Requieren Node 22.6 o superior.

```bash
npm run admin:pending
npm run admin:quote -- VAL-1051 --valor 18500 --transportadora "Inter Rapidísimo" [--nota "Recoges en la oficina del centro"]
```

- `admin:pending` lista las solicitudes que esperan cotización, con los
  datos necesarios para cotizar y contactar al cliente (solo en la terminal).
- `admin:quote` muestra el pedido y la cotización, pide confirmación y solo
  entonces la guarda en una transacción corta; si el pedido cambió mientras
  lo revisabas, no guarda nada y pide volver a ejecutarlo. Rechaza $0,
  decimales, pedidos cancelados, aceptados o no aceptados. Imprime el
  enlace del pedido (usa `SITE_URL`, ver `.env.example`) y un mensaje listo
  para copiar; no asume desde qué aplicación se envía.
- Cotiza solo después de revisar una tarifa real con la transportadora: el
  sistema no tiene tarifas ni integración con transportadoras.

## Verificación del pago y despacho (P0-B4a)

`payment_reported` solo significa que el cliente **afirma** haber
transferido. `paid` significa que VALENCIANO **verificó personalmente el
ingreso real** en su cuenta. Ningún botón ni acción pública puede poner
`paid`: solo `admin:paid`.

```bash
npm run admin:pending   # 1. por cotizar · 2. pagos reportados por verificar · 3. pagados por despachar
npm run admin:paid -- VAL-1051 [--nota "Verificado en la app del banco"]
npm run admin:paid -- VAL-1051 --sin-reporte --metodo nequi|bancolombia [--nota "..."]
npm run admin:ship -- VAL-1051 --transportadora "Inter Rapidísimo" --guia "<número>" [--nota "..."]
npm run admin:ship -- VAL-1051 --transportadora "..." --sin-guia --nota "<cómo se entrega>"
npm run admin:ship -- VAL-1051 --corregir-guia "<número>"
```

- `admin:paid`: exige pago reportado (o `--sin-reporte --metodo` cuando el
  cliente transfirió pero no pulsó "Ya realicé el pago"; `payment_reported_at`
  queda vacío y la nota lo indica). Muestra el valor exacto a verificar (solo
  prendas) y pide escribir el número del pedido. La referencia `VAL-XXXX` es
  una ayuda: puede no aparecer en el movimiento bancario; lo que se verifica
  es el ingreso real. Deja `paid` + `paid_at` + `order_status = preparing`.
  No guardes números de cuenta en la nota.
- `admin:ship`: solo pedidos pagados, no cancelados ni despachados. Deja
  `shipped`, `shipped_at`, transportadora final, guía y nota. Si la
  transportadora final es distinta de la aceptada, aborta salvo
  `--cambio-transportadora-autorizado` con `--nota`. Nunca modifica el valor
  de envío aceptado. `--sin-guia` exige `--nota`; nunca se guarda una guía de
  relleno. `--corregir-guia` cambia solo la guía.
- Ambos confirman escribiendo el número del pedido fuera de cualquier
  transacción y luego guardan en una transacción corta que aborta si el
  pedido cambió mientras lo revisabas.

**Antes de aplicar `0004_payment_and_shipment.sql` en una base con datos**,
verifica que no haya pedidos marcados `shipped` a mano (la migración fallaría
completa, sin cambiar nada):

```sql
SELECT order_number, payment_status FROM orders WHERE order_status = 'shipped';
```

**Pendiente antes de abrir ventas reales (P0-B4b y P0-B5):** acuse de recibo
durable, impresión/descarga del resumen, datos legales públicos, tiempo de
entrega definitivo, tratamiento tributario, términos y privacidad.

## Datos legales del vendedor (P0-B2)

La ley (Ley 1480 de 2011, art. 50 lit. a) exige publicar la identidad y el
contacto del vendedor. Esos datos son personales, así que **nunca van en el
código ni en el repositorio**: viven solo en variables de entorno.

| Variable | Contenido |
| --- | --- |
| `LEGAL_SELLER_NAME` | Nombre completo o razón social, como figura en el RUT |
| `LEGAL_SELLER_NIT` | NIT con dígito de verificación, formato `NNNNNNNNN-D` |
| `LEGAL_NOTICE_ADDRESS` | Dirección de notificación judicial |
| `LEGAL_CITY` | Ciudad de esa dirección |
| `LEGAL_PHONE` | Teléfono de atención |
| `LEGAL_EMAIL` | Correo de atención de la marca |

1. Complétalas en `.env.local` (local) y en Vercel → Project Settings →
   Environment Variables (Production y Preview).
2. Verifícalas con:
   ```bash
   npm run check:legal          # estado de cada variable (sin mostrar valores)
   npm run check:legal -- --show  # además imprime los valores normalizados
   ```
   Requiere Node 22.6 o superior. Lee las variables del entorno y de
   `.env.production.local`, `.env.local`, `.env.production` y `.env` (mismo
   orden que Next.js en producción). Falla si falta una variable, está vacía,
   parece un valor de ejemplo, el correo o el teléfono tienen formato
   inválido o el dígito de verificación del NIT no corresponde (algoritmo de
   la DIAN). Valida **formato**, no qué dato corresponde publicar legalmente.

Código: `src/lib/legal/sellerIdentity.ts` (validación pura),
`src/lib/legal/server.ts` (lectura server-side) y `src/data/legal.ts` (datos
públicos de la marca: nombre comercial, Instagram, enlace a la SIC).
Todavía ninguna página muestra estos datos.

## Deploy

Este proyecto se puede desplegar gratis en [Vercel](https://vercel.com/new)
conectando este repositorio de GitHub — detecta Next.js automáticamente.
