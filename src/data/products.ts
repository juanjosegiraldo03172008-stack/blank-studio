import { PRICING, type PriceTiers } from "./pricing";

export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL"] as const;
export type Size = (typeof ALL_SIZES)[number];

/** Tallas 2XL disponibles únicamente en estos colores (regla del negocio). */
export const EXTENDED_SIZE_COLORS: ColorId[] = ["negro", "blanco"];

export type ColorId =
  | "blanco"
  | "perla"
  | "vainilla"
  | "beige"
  | "tabaco"
  | "rosado-bebe"
  | "azul-cielo"
  | "rojo"
  | "valley"
  | "verde-antioquia"
  | "verde-botella"
  | "verde-militar"
  | "plomo-plata"
  | "gris-oscuro"
  | "negro"
  | "camel"
  | "palo-de-rosa"
  | "verde-menta"
  | "verde-manzana"
  | "verde-limon"
  | "azul-navy"
  | "chocolate"
  | "rubor"
  | "bronce"
  | "crema"
  | "melon"
  | "arena"
  | "merlot"
  | "azul-profundo";

/**
 * Hex aproximados a partir del catálogo oficial. Son de referencia visual;
 * si tienes los Pantone/hex exactos de tela, ajusta acá (único archivo a tocar).
 */
export const COLORS: Record<ColorId, { name: string; hex: string }> = {
  blanco: { name: "Blanco", hex: "#f4f2ec" },
  perla: { name: "Perla", hex: "#e9e4da" },
  vainilla: { name: "Vainilla", hex: "#f6e0ac" },
  beige: { name: "Beige", hex: "#d6bfa7" },
  tabaco: { name: "Tabaco", hex: "#b56a3c" },
  "rosado-bebe": { name: "Rosado Bebé", hex: "#eec9c9" },
  "azul-cielo": { name: "Azul Cielo", hex: "#8fc0de" },
  rojo: { name: "Rojo", hex: "#b23328" },
  valley: { name: "Valley", hex: "#c4d9c8" },
  "verde-antioquia": { name: "Verde Antioquia", hex: "#1f9b4c" },
  "verde-botella": { name: "Verde Botella", hex: "#1f4f3b" },
  "verde-militar": { name: "Verde Militar", hex: "#4b5320" },
  "plomo-plata": { name: "Plomo Plata", hex: "#aca9a2" },
  "gris-oscuro": { name: "Gris Oscuro", hex: "#3f3e3c" },
  negro: { name: "Negro", hex: "#161616" },
  camel: { name: "Camel", hex: "#be9160" },
  "palo-de-rosa": { name: "Palo de Rosa", hex: "#c99a96" },
  "verde-menta": { name: "Verde Menta", hex: "#a9dcc9" },
  "verde-manzana": { name: "Verde Manzana", hex: "#8cc63f" },
  "verde-limon": { name: "Verde Limón", hex: "#cfe05a" },
  "azul-navy": { name: "Azul Navy", hex: "#1c2740" },
  chocolate: { name: "Chocolate", hex: "#4a3626" },
  rubor: { name: "Rubor", hex: "#e3b7b4" },
  bronce: { name: "Bronce", hex: "#8a5a34" },
  crema: { name: "Crema", hex: "#ece4d2" },
  melon: { name: "Melón", hex: "#f0d8b0" },
  arena: { name: "Arena", hex: "#e7e0d8" },
  merlot: { name: "Merlot", hex: "#3b1316" },
  "azul-profundo": { name: "Azul Profundo", hex: "#0a1233" },
};

/**
 * CORE COLORS aparecen primero y con mayor prioridad visual — son el ADN
 * atemporal de la marca. Los demás colores del registro (tonos vivos,
 * pasteles) se muestran como colores de temporada, con menor jerarquía.
 */
export const CORE_COLORS: ColorId[] = [
  "blanco",
  "perla",
  "vainilla",
  "beige",
  "camel",
  "tabaco",
  "chocolate",
  "negro",
  "gris-oscuro",
  "plomo-plata",
  "azul-navy",
  "verde-militar",
  "verde-botella",
  "palo-de-rosa",
];

export type ProductLine =
  | "essentials-200"
  | "essentials-300"
  | "oversize-200"
  | "oversize-300"
  | "origin"
  | "origin-negro"
  | "origin-unstoppable"
  | "origin-perla"
  | "legacy-chocolate"
  | "legacy-merlot"
  | "legacy-negro";

export type Fit = "essential" | "oversize";

/** Colección comercial — determina en qué página/nav vive el producto. */
export type Collection = "iconic" | "origin" | "legacy";

export interface SizeChartRow {
  size: Size;
  chestCm: number;
  lengthCm: number;
}

export interface ProductMediaItem {
  src: string;
  alt: string;
  role: "front" | "back" | "detail" | "model";
}

export interface Product {
  slug: string;
  line: ProductLine;
  collection: Collection;
  name: string;
  fit: Fit;
  gsm: 200 | 300;
  tagline: string;
  description: string;
  details: string[];
  sizes: Size[];
  sizeChart: SizeChartRow[];
  colorsLinea: ColorId[];
  colorsTemporada: ColorId[];
  imageFolder: string;
  /** Foto real de catálogo mostrada de portada (no ligada a un color específico). */
  coverImage: string;
  /**
   * Galería explícita por color (frente/espalda/detalle/modelo, cualquier
   * cantidad de imágenes). Si no está definida para un color, se usa el
   * patrón heredado `${imageFolder}/${color}-N.jpg` con 3 imágenes fijas.
   */
  media?: Partial<Record<ColorId, ProductMediaItem[]>>;
  /**
   * Precio público B2C fijo por unidad. No varía con la cantidad ni la
   * talla. Todos los productos lo usan — ver getUnitPrice más abajo.
   */
  retailPrice: number;
}

export const PRODUCTS: Product[] = [
  {
    slug: "essentials-200",
    line: "essentials-200",
    collection: "iconic",
    name: "Essentials 200",
    fit: "essential",
    gsm: 200,
    tagline: "Horma normal, peso ligero",
    description:
      "La base de un guardarropa limpio. Corte recto de horma normal en algodón peruano de 200 GSM: ligera, fresca y perfecta para el día a día sin sacrificar estilo.",
    details: [
      "100% algodón peruano",
      "200 GSM — tejido ligero",
      "Horma normal (essential fit)",
      "Cuello sin etiqueta visible",
      "Hecho para durar",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    sizeChart: [
      { size: "XS", chestCm: 44, lengthCm: 69 },
      { size: "S", chestCm: 47, lengthCm: 70 },
      { size: "M", chestCm: 49, lengthCm: 71 },
      { size: "L", chestCm: 55, lengthCm: 73 },
      { size: "XL", chestCm: 57, lengthCm: 75 },
      { size: "2XL", chestCm: 62, lengthCm: 77 },
    ],
    colorsLinea: [
      "blanco",
      "perla",
      "vainilla",
      "beige",
      "tabaco",
      "rojo",
      "verde-botella",
      "plomo-plata",
      "gris-oscuro",
      "negro",
    ],
    colorsTemporada: [],
    imageFolder: "/products/essentials-200",
    coverImage: "/catalog/essentials-200-negro.jpg",
    retailPrice: 64900,

    // ---- essentials-200 media ----
    media: {
      blanco: [
        { src: "/products/essentials-200/blanco-front.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/blanco-back.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/blanco-detail.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/blanco-model-1.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/blanco-model-2.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/blanco-model-3.jpg", alt: "Essentials 200 Blanco VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      perla: [
        { src: "/products/essentials-200/perla-front.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/perla-back.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/perla-detail.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/perla-model-1.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/perla-model-2.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/perla-model-3.jpg", alt: "Essentials 200 Perla VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      vainilla: [
        { src: "/products/essentials-200/vainilla-front.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/vainilla-back.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/vainilla-detail.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/vainilla-model-1.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/vainilla-model-2.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/vainilla-model-3.jpg", alt: "Essentials 200 Vainilla VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      beige: [
        { src: "/products/essentials-200/beige-front.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/beige-back.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/beige-detail.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/beige-model-1.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/beige-model-2.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/beige-model-3.jpg", alt: "Essentials 200 Beige VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      tabaco: [
        { src: "/products/essentials-200/tabaco-front.jpg", alt: "Essentials 200 Tabaco VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/tabaco-detail.jpg", alt: "Essentials 200 Tabaco VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/tabaco-model-1.jpg", alt: "Essentials 200 Tabaco VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/tabaco-model-2.jpg", alt: "Essentials 200 Tabaco VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/tabaco-model-3.jpg", alt: "Essentials 200 Tabaco VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      rojo: [
        { src: "/products/essentials-200/rojo-front.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/rojo-back.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/rojo-detail.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/rojo-model-1.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/rojo-model-2.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/rojo-model-3.jpg", alt: "Essentials 200 Rojo VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "verde-botella": [
        { src: "/products/essentials-200/verde-botella-front.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/verde-botella-back.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/verde-botella-detail.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/verde-botella-model-1.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/verde-botella-model-2.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/verde-botella-model-3.jpg", alt: "Essentials 200 Verde Botella VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "plomo-plata": [
        { src: "/products/essentials-200/plomo-plata-back.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/plomo-plata-detail.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/plomo-plata-model-1.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 1 de 4", role: "model" },
        { src: "/products/essentials-200/plomo-plata-model-2.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 2 de 4", role: "model" },
        { src: "/products/essentials-200/plomo-plata-model-3.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 3 de 4", role: "model" },
        { src: "/products/essentials-200/plomo-plata-model-4.jpg", alt: "Essentials 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 4 de 4", role: "model" },
      ],
      "gris-oscuro": [
        { src: "/products/essentials-200/gris-oscuro-front.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/gris-oscuro-back.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/gris-oscuro-detail.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/gris-oscuro-model-1.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/gris-oscuro-model-2.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/gris-oscuro-model-3.jpg", alt: "Essentials 200 Gris Oscuro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      negro: [
        { src: "/products/essentials-200/negro-front.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-200/negro-back.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-200/negro-detail.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-200/negro-model-1.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-200/negro-model-2.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-200/negro-model-3.jpg", alt: "Essentials 200 Negro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
    },
  },
  {
    slug: "essentials-300",
    line: "essentials-300",
    collection: "iconic",
    name: "Essentials 300",
    fit: "essential",
    gsm: 300,
    tagline: "Horma normal, peso completo",
    description:
      "La misma horma essential en algodón peruano de 300 GSM: más cuerpo, más presencia y una caída firme y suave.",
    details: [
      "100% algodón peruano",
      "300 GSM — tacto firme y suave",
      "Horma normal (essential fit)",
      "Caída más estructurada, con mayor cuerpo",
      "Colores sólidos, sin estampados",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 48, lengthCm: 70 },
      { size: "S", chestCm: 50, lengthCm: 72 },
      { size: "M", chestCm: 55, lengthCm: 73 },
      { size: "L", chestCm: 58, lengthCm: 75 },
      { size: "XL", chestCm: 61, lengthCm: 77 },
    ],
    colorsLinea: [
      "blanco",
      "perla",
      "beige",
      "chocolate",
      "azul-navy",
      "verde-botella",
      "plomo-plata",
      "gris-oscuro",
      "negro",
    ],
    colorsTemporada: [],
    imageFolder: "/products/essentials-300",
    coverImage: "/catalog/essentials-300-beige.jpg",
    retailPrice: 89900,

    // ---- essentials-300 media ----
    media: {
      blanco: [
        { src: "/products/essentials-300/blanco-front.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/blanco-back.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/blanco-detail.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/blanco-model-1.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/blanco-model-2.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/blanco-model-3.jpg", alt: "Essentials 300 Blanco VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      perla: [
        { src: "/products/essentials-300/perla-front.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/perla-back.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/perla-detail.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/perla-model-1.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/perla-model-2.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/perla-model-3.jpg", alt: "Essentials 300 Perla VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      beige: [
        { src: "/products/essentials-300/beige-front.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/beige-back.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/beige-detail.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/beige-model-1.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/beige-model-2.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/beige-model-3.jpg", alt: "Essentials 300 Beige VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      chocolate: [
        { src: "/products/essentials-300/chocolate-front.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/chocolate-back.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/chocolate-detail.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/chocolate-model-1.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/chocolate-model-2.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/chocolate-model-3.jpg", alt: "Essentials 300 Chocolate VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "azul-navy": [
        { src: "/products/essentials-300/azul-navy-front.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/azul-navy-back.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/azul-navy-detail.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/azul-navy-model-1.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/azul-navy-model-2.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/azul-navy-model-3.jpg", alt: "Essentials 300 Azul Navy VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "verde-botella": [
        { src: "/products/essentials-300/verde-botella-front.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/verde-botella-back.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/verde-botella-detail.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/verde-botella-model-1.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/verde-botella-model-2.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/verde-botella-model-3.jpg", alt: "Essentials 300 Verde Botella VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "plomo-plata": [
        { src: "/products/essentials-300/plomo-plata-front.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/plomo-plata-back.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/plomo-plata-detail.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/plomo-plata-model-1.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/plomo-plata-model-2.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/plomo-plata-model-3.jpg", alt: "Essentials 300 Plomo Plata VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "gris-oscuro": [
        { src: "/products/essentials-300/gris-oscuro-front.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/gris-oscuro-back.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/gris-oscuro-detail.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/gris-oscuro-model-1.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/gris-oscuro-model-2.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/gris-oscuro-model-3.jpg", alt: "Essentials 300 Gris Oscuro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      negro: [
        { src: "/products/essentials-300/negro-front.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/essentials-300/negro-back.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/essentials-300/negro-detail.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/essentials-300/negro-model-1.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/essentials-300/negro-model-2.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/essentials-300/negro-model-3.jpg", alt: "Essentials 300 Negro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
    },
  },
  {
    slug: "oversize-200",
    line: "oversize-200",
    collection: "iconic",
    name: "Oversize 200",
    fit: "oversize",
    gsm: 200,
    tagline: "Horma oversize, peso ligero",
    description:
      "Silueta amplia y caída relajada en algodón peruano de 200 GSM, con cuello en rib. Alto gramaje aparente y suavidad, en un corte unisex.",
    details: [
      "100% algodón peruano",
      "200 GSM — tela de alto gramaje",
      "Horma oversize unisex",
      "Cuello en rib",
      "Fit amplio, hombro caído y manga generosa",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    sizeChart: [
      { size: "XS", chestCm: 53, lengthCm: 70.5 },
      { size: "S", chestCm: 57, lengthCm: 73 },
      { size: "M", chestCm: 59, lengthCm: 76 },
      { size: "L", chestCm: 62, lengthCm: 77 },
      { size: "XL", chestCm: 65, lengthCm: 79 },
      { size: "2XL", chestCm: 68, lengthCm: 80 },
    ],
    colorsLinea: [
      "blanco",
      "perla",
      "beige",
      "rojo",
      "verde-botella",
      "plomo-plata",
      "negro",
    ],
    colorsTemporada: [],
    imageFolder: "/products/oversize-200",
    coverImage: "/catalog/oversize-200-bronce.jpg",
    retailPrice: 79900,

    // ---- oversize-200 media ----
    media: {
      blanco: [
        { src: "/products/oversize-200/blanco-front.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/blanco-back.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/blanco-detail.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/blanco-model-1.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/blanco-model-2.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/blanco-model-3.jpg", alt: "Oversize 200 Blanco VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      perla: [
        { src: "/products/oversize-200/perla-front.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/perla-back.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/perla-detail.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/perla-model-1.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/perla-model-2.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/perla-model-3.jpg", alt: "Oversize 200 Perla VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      beige: [
        { src: "/products/oversize-200/beige-front.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/beige-back.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/beige-detail.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/beige-model-1.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/beige-model-2.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/beige-model-3.jpg", alt: "Oversize 200 Beige VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      rojo: [
        { src: "/products/oversize-200/rojo-front.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/rojo-back.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/rojo-detail.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/rojo-model-1.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/rojo-model-2.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/rojo-model-3.jpg", alt: "Oversize 200 Rojo VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "verde-botella": [
        { src: "/products/oversize-200/verde-botella-front.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/verde-botella-back.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/verde-botella-detail.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/verde-botella-model-1.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/verde-botella-model-2.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/verde-botella-model-3.jpg", alt: "Oversize 200 Verde Botella VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      "plomo-plata": [
        { src: "/products/oversize-200/plomo-plata-back.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/plomo-plata-detail.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/plomo-plata-model-1.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 1 de 4", role: "model" },
        { src: "/products/oversize-200/plomo-plata-model-2.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 2 de 4", role: "model" },
        { src: "/products/oversize-200/plomo-plata-model-3.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 3 de 4", role: "model" },
        { src: "/products/oversize-200/plomo-plata-model-4.jpg", alt: "Oversize 200 Plomo Plata VALENCIANO ICONIC — modelo, vista 4 de 4", role: "model" },
      ],
      negro: [
        { src: "/products/oversize-200/negro-front.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-200/negro-back.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-200/negro-detail.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-200/negro-model-1.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-200/negro-model-2.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-200/negro-model-3.jpg", alt: "Oversize 200 Negro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
    },
  },
  {
    slug: "oversize-300",
    line: "oversize-300",
    collection: "iconic",
    name: "Oversize 300",
    fit: "oversize",
    gsm: 300,
    tagline: "Horma oversize, peso completo",
    description:
      "La versión más densa de nuestra silueta oversize: algodón peruano de 300 GSM, cuello en rib y la mayor presencia del catálogo. Tacto firme y suave.",
    details: [
      "100% algodón peruano",
      "300 GSM — alto gramaje",
      "Horma oversize unisex",
      "Cuello en rib",
      "Tejido de mayor cuerpo, con una caída más estructurada y sensación de peso superior",
    ],
    sizes: ["S", "M", "L", "XL"],
    sizeChart: [
      { size: "S", chestCm: 59, lengthCm: 77 },
      { size: "M", chestCm: 63, lengthCm: 78 },
      { size: "L", chestCm: 65, lengthCm: 80 },
      { size: "XL", chestCm: 69, lengthCm: 84 },
    ],
    colorsLinea: ["blanco", "beige", "merlot", "azul-profundo", "negro"],
    colorsTemporada: [],
    imageFolder: "/products/oversize-300",
    coverImage: "/catalog/oversize-300-stack.jpg",
    retailPrice: 109900,

    // ---- oversize-300 media ----
    media: {
      blanco: [
        { src: "/products/oversize-300/blanco-front.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-300/blanco-back.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-300/blanco-detail.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-300/blanco-model-1.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-300/blanco-model-2.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-300/blanco-model-3.jpg", alt: "Oversize 300 Blanco VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      beige: [
        { src: "/products/oversize-300/beige-front.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-300/beige-back.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-300/beige-detail.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-300/beige-model-1.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-300/beige-model-2.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-300/beige-model-3.jpg", alt: "Oversize 300 Beige VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      merlot: [
        { src: "/products/oversize-300/merlot-back.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-300/merlot-detail.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-300/merlot-model-1.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — modelo, vista 1 de 4", role: "model" },
        { src: "/products/oversize-300/merlot-model-2.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — modelo, vista 2 de 4", role: "model" },
        { src: "/products/oversize-300/merlot-model-3.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — modelo, vista 3 de 4", role: "model" },
        { src: "/products/oversize-300/merlot-model-4.jpg", alt: "Oversize 300 Merlot VALENCIANO ICONIC — modelo, vista 4 de 4", role: "model" },
      ],
      "azul-profundo": [
        { src: "/products/oversize-300/azul-profundo-front.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-300/azul-profundo-back.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-300/azul-profundo-detail.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-300/azul-profundo-model-1.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-300/azul-profundo-model-2.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-300/azul-profundo-model-3.jpg", alt: "Oversize 300 Azul Profundo VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
      negro: [
        { src: "/products/oversize-300/negro-front.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — vista frontal", role: "front" },
        { src: "/products/oversize-300/negro-back.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — vista posterior", role: "back" },
        { src: "/products/oversize-300/negro-detail.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — detalle del estampado", role: "detail" },
        { src: "/products/oversize-300/negro-model-1.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — modelo, vista 1 de 3", role: "model" },
        { src: "/products/oversize-300/negro-model-2.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — modelo, vista 2 de 3", role: "model" },
        { src: "/products/oversize-300/negro-model-3.jpg", alt: "Oversize 300 Negro VALENCIANO ICONIC — modelo, vista 3 de 3", role: "model" },
      ],
    },
  },
  {
    slug: "origin-legacy-of-luxury",
    line: "origin",
    collection: "origin",
    name: "Origin — Legacy Of Luxury",
    fit: "oversize",
    gsm: 200,
    tagline: "Oversize · Arena",
    description:
      "Primera referencia de Origin: oversize en algodón peruano de 200 GSM, color arena, con texto pequeño al pecho y estampado grande en la espalda inspirado en el mundo del streetwear premium.",
    details: [
      "100% algodón peruano",
      "200 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 53, lengthCm: 70.5 },
      { size: "S", chestCm: 57, lengthCm: 73 },
      { size: "M", chestCm: 59, lengthCm: 76 },
      { size: "L", chestCm: 62, lengthCm: 77 },
      { size: "XL", chestCm: 65, lengthCm: 79 },
    ],
    colorsLinea: ["arena"],
    colorsTemporada: [],
    imageFolder: "/products/origin-arena",
    coverImage: "/products/origin-arena/arena-2.jpg",
    retailPrice: 139900,
    media: {
      arena: [
        { src: "/products/origin-arena/arena-2.jpg", alt: "Origin Arena VALENCIANO ORIGIN — vista frontal", role: "front" },
        { src: "/products/origin-arena/arena-3.jpg", alt: "Origin Arena VALENCIANO ORIGIN — vista posterior, estampado Legacy Of Luxury", role: "back" },
        { src: "/products/origin-arena/arena-1.jpg", alt: "Origin Arena VALENCIANO ORIGIN — detalle de cuello", role: "detail" },
      ],
    },
  },
  {
    slug: "origin-negro",
    line: "origin-negro",
    collection: "origin",
    name: "Origin — Unreal Essentials",
    fit: "oversize",
    gsm: 200,
    tagline: "Horma oversize, estampado exclusivo",
    description:
      "Segunda referencia de Origin: oversize en algodón peruano de 200 GSM, con texto pequeño al pecho y el estampado 'Unreal Essentials — Valenciano Montecarlo' en la espalda.",
    details: [
      "100% algodón peruano",
      "200 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 53, lengthCm: 70.5 },
      { size: "S", chestCm: 57, lengthCm: 73 },
      { size: "M", chestCm: 59, lengthCm: 76 },
      { size: "L", chestCm: 62, lengthCm: 77 },
      { size: "XL", chestCm: 65, lengthCm: 79 },
    ],
    colorsLinea: ["negro", "vainilla"],
    colorsTemporada: [],
    imageFolder: "/products/origin-negro",
    coverImage: "/products/origin-negro/negro-1.jpg",
    retailPrice: 139900,
    media: {
      negro: [
        { src: "/products/origin-negro/negro-1.jpg", alt: "Origin Negro VALENCIANO ORIGIN — vista frontal", role: "front" },
        { src: "/products/origin-negro/negro-2.jpg", alt: "Origin Negro VALENCIANO ORIGIN — vista posterior, estampado Unreal Essentials", role: "back" },
        { src: "/products/origin-negro/negro-3.jpg", alt: "Origin Negro VALENCIANO ORIGIN — detalle de estampado", role: "detail" },
      ],
      vainilla: [
        { src: "/products/origin-negro/vainilla-1.jpg", alt: "Origin Vainilla VALENCIANO ORIGIN — vista frontal", role: "front" },
        { src: "/products/origin-negro/vainilla-2.jpg", alt: "Origin Vainilla VALENCIANO ORIGIN — vista posterior, estampado Unreal Essentials", role: "back" },
        { src: "/products/origin-negro/vainilla-3.jpg", alt: "Origin Vainilla VALENCIANO ORIGIN — detalle de estampado", role: "detail" },
      ],
    },
  },
  {
    slug: "origin-unstoppable",
    line: "origin-unstoppable",
    collection: "origin",
    name: "Origin — Unstoppable",
    fit: "oversize",
    gsm: 200,
    tagline: "Horma oversize, estampado exclusivo",
    description:
      "Tercera referencia de Origin: oversize en algodón peruano de 200 GSM, con texto pequeño al pecho y el estampado 'Unstoppable — Stay In Motion' en la espalda.",
    details: [
      "100% algodón peruano",
      "200 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 53, lengthCm: 70.5 },
      { size: "S", chestCm: 57, lengthCm: 73 },
      { size: "M", chestCm: 59, lengthCm: 76 },
      { size: "L", chestCm: 62, lengthCm: 77 },
      { size: "XL", chestCm: 65, lengthCm: 79 },
    ],
    colorsLinea: ["vainilla"],
    colorsTemporada: [],
    imageFolder: "/products/origin-unstoppable",
    coverImage: "/products/origin-unstoppable/vainilla-1.jpg",
    retailPrice: 139900,
    media: {
      vainilla: [
        { src: "/products/origin-unstoppable/vainilla-1.jpg", alt: "Origin Unstoppable VALENCIANO ORIGIN — vista frontal", role: "front" },
        { src: "/products/origin-unstoppable/vainilla-2.jpg", alt: "Origin Unstoppable VALENCIANO ORIGIN — vista posterior, estampado Unstoppable", role: "back" },
        { src: "/products/origin-unstoppable/vainilla-3.jpg", alt: "Origin Unstoppable VALENCIANO ORIGIN — detalle de estampado", role: "detail" },
      ],
    },
  },
  {
    slug: "origin-perla",
    line: "origin-perla",
    collection: "origin",
    name: "Origin — Perla",
    fit: "oversize",
    gsm: 200,
    tagline: "Oversize · Perla",
    description:
      "Cuarta referencia de Origin: oversize en algodón peruano de 200 GSM, color perla, con texto pequeño al pecho y el estampado 'Built From Nothing — Driven By Purpose' en la espalda.",
    details: [
      "100% algodón peruano",
      "200 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 53, lengthCm: 70.5 },
      { size: "S", chestCm: 57, lengthCm: 73 },
      { size: "M", chestCm: 59, lengthCm: 76 },
      { size: "L", chestCm: 62, lengthCm: 77 },
      { size: "XL", chestCm: 65, lengthCm: 79 },
    ],
    colorsLinea: ["perla"],
    colorsTemporada: [],
    imageFolder: "/products/origin-perla",
    coverImage: "/products/origin-perla/perla-1.jpg",
    retailPrice: 139900,
    media: {
      perla: [
        { src: "/products/origin-perla/perla-1.jpg", alt: "Origin Perla VALENCIANO ORIGIN — vista frontal", role: "front" },
        { src: "/products/origin-perla/perla-2.jpg", alt: "Origin Perla VALENCIANO ORIGIN — vista posterior, estampado Built From Nothing", role: "back" },
        { src: "/products/origin-perla/perla-3.jpg", alt: "Origin Perla VALENCIANO ORIGIN — detalle de estampado", role: "detail" },
      ],
    },
  },
  {
    slug: "legacy-chocolate",
    line: "legacy-chocolate",
    collection: "legacy",
    name: "Legacy — Chocolate",
    fit: "essential",
    gsm: 300,
    tagline: "Essentials · Chocolate",
    description:
      "Primera referencia de Legacy: horma essential en algodón peruano de 300 GSM, color chocolate, con texto pequeño al pecho y el estampado 'Valenciano Legacy' arqueado en la espalda.",
    details: [
      "100% algodón peruano",
      "300 GSM",
      "Horma essential (normal)",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 48, lengthCm: 70 },
      { size: "S", chestCm: 50, lengthCm: 72 },
      { size: "M", chestCm: 55, lengthCm: 73 },
      { size: "L", chestCm: 58, lengthCm: 75 },
      { size: "XL", chestCm: 61, lengthCm: 77 },
    ],
    colorsLinea: ["chocolate"],
    colorsTemporada: [],
    imageFolder: "/products/legacy-chocolate",
    coverImage: "/products/legacy-chocolate/chocolate-1.jpg",
    retailPrice: 139900,
    media: {
      chocolate: [
        { src: "/products/legacy-chocolate/chocolate-1.jpg", alt: "Legacy chocolate — frente", role: "front" },
        { src: "/products/legacy-chocolate/chocolate-2.jpg", alt: "Legacy chocolate — espalda, estampado Valenciano Legacy", role: "back" },
        { src: "/products/legacy-chocolate/chocolate-3.jpg", alt: "Legacy chocolate — detalle de cuello", role: "detail" },
        { src: "/products/legacy-chocolate/chocolate-4.jpg", alt: "Legacy chocolate — detalle de tela y estampado", role: "detail" },
      ],
    },
  },
  {
    slug: "legacy-merlot",
    line: "legacy-merlot",
    collection: "legacy",
    name: "Legacy — Merlot",
    fit: "oversize",
    gsm: 300,
    tagline: "Oversize · Merlot",
    description:
      "Segunda referencia de Legacy: oversize en algodón peruano de 300 GSM, color merlot, con texto pequeño al pecho y el estampado 'Valenciano Legacy' con tipografía desgastada en la espalda — Designed for the timeless.",
    details: [
      "100% algodón peruano",
      "300 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 58, lengthCm: 75 },
      { size: "S", chestCm: 59, lengthCm: 77 },
      { size: "M", chestCm: 63, lengthCm: 78 },
      { size: "L", chestCm: 65, lengthCm: 80 },
      { size: "XL", chestCm: 69, lengthCm: 84 },
    ],
    colorsLinea: ["merlot"],
    colorsTemporada: [],
    imageFolder: "/products/legacy-merlot",
    coverImage: "/products/legacy-merlot/merlot-1.jpg",
    retailPrice: 159900,
    media: {
      merlot: [
        { src: "/products/legacy-merlot/merlot-1.jpg", alt: "Legacy merlot — frente", role: "front" },
        { src: "/products/legacy-merlot/merlot-2.jpg", alt: "Legacy merlot — espalda", role: "back" },
        { src: "/products/legacy-merlot/merlot-3.jpg", alt: "Legacy merlot — modelo frente", role: "model" },
        { src: "/products/legacy-merlot/merlot-4.jpg", alt: "Legacy merlot — modelo espalda", role: "model" },
        { src: "/products/legacy-merlot/merlot-5.jpg", alt: "Legacy merlot — detalle pecho", role: "detail" },
        { src: "/products/legacy-merlot/merlot-6.jpg", alt: "Legacy merlot — detalle espalda", role: "detail" },
      ],
    },
  },
  {
    slug: "legacy-negro",
    line: "legacy-negro",
    collection: "legacy",
    name: "Legacy — Negro",
    fit: "oversize",
    gsm: 300,
    tagline: "Oversize · Negro",
    description:
      "Tercera referencia de Legacy: oversize en algodón peruano de 300 GSM, color negro, con texto pequeño al pecho y un gran estampado artístico 'Legacy' en la espalda — What we create may outlive us.",
    details: [
      "100% algodón peruano",
      "300 GSM",
      "Horma oversize unisex",
      "Estampado frente y espalda",
      "Empaque y etiquetado personalizado incluido",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 58, lengthCm: 75 },
      { size: "S", chestCm: 59, lengthCm: 77 },
      { size: "M", chestCm: 63, lengthCm: 78 },
      { size: "L", chestCm: 65, lengthCm: 80 },
      { size: "XL", chestCm: 69, lengthCm: 84 },
    ],
    colorsLinea: ["negro"],
    colorsTemporada: [],
    imageFolder: "/products/legacy-negro",
    coverImage: "/products/legacy-negro/negro-1.jpg",
    retailPrice: 159900,
    media: {
      negro: [
        { src: "/products/legacy-negro/negro-1.jpg", alt: "Legacy negro — frente", role: "front" },
        { src: "/products/legacy-negro/negro-2.jpg", alt: "Legacy negro — espalda, estampado Legacy", role: "back" },
        { src: "/products/legacy-negro/negro-3.jpg", alt: "Legacy negro — detalle de cuello", role: "detail" },
      ],
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function allColorsFor(product: Product): ColorId[] {
  return [...product.colorsLinea, ...product.colorsTemporada];
}

export function isSizeAvailable(
  product: Product,
  size: Size,
  color: ColorId
): boolean {
  if (!product.sizes.includes(size)) return false;
  if (size !== "2XL") return true;
  return EXTENDED_SIZE_COLORS.includes(color);
}

/**
 * Escalas por cantidad (mayorista/emprendedor/pionero/visionario/detal) —
 * infraestructura B2B conservada en datos, pero ya no impulsa el precio
 * mostrado al público (ver getUnitPrice). Queda lista para un futuro canal
 * mayorista independiente.
 */
export function getPriceTiers(line: ProductLine, size: Size): PriceTiers | null {
  const pricing = (PRICING as Partial<typeof PRICING>)[line as keyof typeof PRICING];
  if (!pricing) return null;
  return size === "2XL" ? pricing.xxl : pricing.base;
}

/**
 * Precio público B2C — fijo por unidad, no varía con la talla ni la
 * cantidad. Todos los productos (Iconic, Origin, Legacy) usan su
 * `retailPrice`.
 */
export function getUnitPrice(line: ProductLine): number | null {
  const product = PRODUCTS.find((p) => p.line === line);
  return product?.retailPrice ?? null;
}

export function formatCOP(value: number | null): string {
  if (value === null) return "Próximamente";
  // Intl currency formatting for es-CO inserts a space after "$" — se quita
  // a mano para que quede "$61.900", no "$ 61.900".
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}
