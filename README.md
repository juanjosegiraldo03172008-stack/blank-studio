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

Desde P0-A existe una sola ruta de compra, **sin pasarela de pago**:

carrito → `/pedido` (datos de entrega) → "Continuar al pago" → se crea el
pedido real en base de datos (`pending_payment`) → `/pedido/[id]` (datos
de Nequi/Bancolombia) → el cliente reporta la transferencia
(`payment_reported`) → VALENCIANO verifica el ingreso manualmente → `paid`
(solo manual, nunca automático). El envío se paga al recibir.

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
