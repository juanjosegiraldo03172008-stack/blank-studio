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

El sitio no tiene pasarela de pago ni checkout real todavía. El flujo de
"Hacer pedido" arma un resumen del carrito, lo copia al portapapeles y abre
el chat directo de Instagram (`@valenciano.co`) para que el cliente lo
pegue y lo envíe. Eso queda centralizado en `src/lib/instagramOrder.ts`.

## Deploy

Este proyecto se puede desplegar gratis en [Vercel](https://vercel.com/new)
conectando este repositorio de GitHub — detecta Next.js automáticamente.
