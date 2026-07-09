import { PRICING, tierForQuantity, type PriceTiers } from "./pricing";

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
  | "melon";

/**
 * Hex aproximados a partir del catálogo oficial. Son de referencia visual;
 * si tienes los Pantone/hex exactos de tela, ajusta acá (único archivo a tocar).
 */
export const COLORS: Record<ColorId, { name: string; hex: string }> = {
  blanco: { name: "Blanco", hex: "#f4f2ec" },
  perla: { name: "Perla", hex: "#e9e4da" },
  vainilla: { name: "Vainilla", hex: "#e2d5b7" },
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
};

export type ProductLine =
  | "essentials-200"
  | "essentials-300"
  | "oversize-200"
  | "oversize-300";

export type Fit = "essential" | "oversize";

export interface SizeChartRow {
  size: Size;
  chestCm: number;
  lengthCm: number;
}

export interface Product {
  slug: string;
  line: ProductLine;
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
}

export const PRODUCTS: Product[] = [
  {
    slug: "essentials-200",
    line: "essentials-200",
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
      "rosado-bebe",
      "azul-cielo",
      "rojo",
      "valley",
      "verde-antioquia",
      "verde-botella",
      "verde-militar",
      "plomo-plata",
      "gris-oscuro",
      "negro",
    ],
    colorsTemporada: ["camel", "palo-de-rosa", "verde-menta", "verde-manzana", "verde-limon"],
    imageFolder: "/products/essentials-200",
    coverImage: "/catalog/essentials-200-negro.jpg",
  },
  {
    slug: "essentials-300",
    line: "essentials-300",
    name: "Essentials 300",
    fit: "essential",
    gsm: 300,
    tagline: "Horma normal, peso completo",
    description:
      "La misma horma essential en algodón peruano de 300 GSM: más cuerpo, más presencia y una caída firme y suave que no se encoge ni se deforma.",
    details: [
      "100% algodón peruano",
      "300 GSM — tacto firme y suave",
      "Horma normal (essential fit)",
      "No se encoge, no se deforma",
      "Colores sólidos que perduran",
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
      "negro",
      "tabaco",
      "verde-botella",
      "gris-oscuro",
      "beige",
      "azul-navy",
      "chocolate",
    ],
    colorsTemporada: [],
    imageFolder: "/products/essentials-300",
    coverImage: "/catalog/essentials-300-beige.jpg",
  },
  {
    slug: "oversize-200",
    line: "oversize-200",
    name: "Oversize 200",
    fit: "oversize",
    gsm: 200,
    tagline: "Horma oversize, peso ligero",
    description:
      "Silueta amplia y caída relajada en algodón peruano de 200 GSM, con cuello en rib. Alto gramaje aparente, suavidad y durabilidad en un corte unisex.",
    details: [
      "100% algodón peruano",
      "200 GSM — tela de alto gramaje",
      "Horma oversize unisex",
      "Cuello en rib",
      "Resistente y duradera",
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
      "vainilla",
      "beige",
      "verde-botella",
      "verde-militar",
      "plomo-plata",
      "gris-oscuro",
      "negro",
    ],
    colorsTemporada: ["rojo", "rubor", "bronce", "crema", "melon"],
    imageFolder: "/products/oversize-200",
    coverImage: "/catalog/oversize-200-bronce.jpg",
  },
  {
    slug: "oversize-300",
    line: "oversize-300",
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
      "No se encoge, no se deforma",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    sizeChart: [
      { size: "XS", chestCm: 58, lengthCm: 75 },
      { size: "S", chestCm: 59, lengthCm: 77 },
      { size: "M", chestCm: 63, lengthCm: 78 },
      { size: "L", chestCm: 65, lengthCm: 80 },
      { size: "XL", chestCm: 69, lengthCm: 84 },
    ],
    colorsLinea: ["blanco", "perla", "negro"],
    colorsTemporada: [],
    imageFolder: "/products/oversize-300",
    coverImage: "/catalog/oversize-300-stack.jpg",
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

export function getPriceTiers(line: ProductLine, size: Size): PriceTiers | null {
  const pricing = PRICING[line];
  return size === "2XL" ? pricing.xxl : pricing.base;
}

export function getUnitPrice(
  line: ProductLine,
  size: Size,
  quantity: number
): number | null {
  const tiers = getPriceTiers(line, size);
  if (!tiers) return null;
  return tiers[tierForQuantity(quantity)];
}

export function formatCOP(value: number | null): string {
  if (value === null) return "Próximamente";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
