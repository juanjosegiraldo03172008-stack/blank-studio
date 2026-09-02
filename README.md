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
| Usuario de Instagram para pedidos | `src/lib/instagramOrder.ts` |
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

El flujo real de compra sigue siendo por Instagram: "Hacer pedido" arma un
resumen del carrito, lo copia al portapapeles y abre el chat directo de
Instagram (`@valenciano.co`) para que el cliente lo pegue y lo envíe. Eso
queda centralizado en `src/lib/instagramOrder.ts` — no se toca ni se
reemplaza mientras se construye el pago real.

En paralelo (FASE 4A), existe una infraestructura de pedidos en base de
datos — todavía **sin pasarela de pago conectada** — que valida todo
server-side y persiste el pedido con estado `pending_payment`. Ver la
siguiente sección para configurarla.

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
start`). Llama al mismo Server Action (`src/app/actions/orders.ts`) que
usará el checkout real más adelante.

**Reglas que ya aplica el servidor** (ver `src/lib/orders/`):

- Precio, nombre y disponibilidad de color/talla se recalculan siempre
  desde `products.ts` — el navegador nunca puede fijar un precio o total.
- El envío se paga contraentrega (`shipping_payment_method:
  cash_on_delivery`) — nunca se suma un costo de envío al subtotal.
- Reenviar la misma solicitud (mismo `idempotencyKey`) devuelve el pedido
  ya creado en vez de duplicarlo.
- El pedido y sus items se crean en una sola transacción — si falla algo,
  no queda un pedido a medias.

## Deploy

Este proyecto se puede desplegar gratis en [Vercel](https://vercel.com/new)
conectando este repositorio de GitHub — detecta Next.js automáticamente.
