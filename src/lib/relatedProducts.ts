import { PRODUCTS, type ColorId, type Product } from "@/data/products";

export interface RelatedItem {
  product: Product;
  color: ColorId;
}

const MAX_ITEMS = 6;
const MAX_SAME_PRODUCT = 3;
const MAX_FAMILY = 2;

/**
 * Recomendaciones para "Seguir explorando" en la PDP — prioriza, en orden:
 * 1. otros colores de la misma referencia (mismo slug);
 * 2. referencias cercanas (mismo fit, distinto gramaje, ordenadas por
 *    cercanía de GSM);
 * 3. una pieza complementaria de otra línea (gramaje más cercano primero).
 * Nunca repite el producto+color actual y da ritmo cromático evitando
 * repetir un color ya usado en una tarjeta previa cuando hay alternativa.
 */
export function getRelatedProducts(
  current: Product,
  currentColor: ColorId,
  max: number = MAX_ITEMS
): RelatedItem[] {
  const items: RelatedItem[] = [];
  const usedColors = new Set<ColorId>([currentColor]);
  const usedSlugs = new Set<string>([current.slug]);

  function pickColor(product: Product): ColorId {
    const fresh = product.colorsLinea.find((c) => !usedColors.has(c));
    const chosen = fresh ?? product.colorsLinea[0];
    usedColors.add(chosen);
    return chosen;
  }

  // 1. Otros colores de la misma referencia.
  const sameProductColors = current.colorsLinea.filter((c) => c !== currentColor);
  for (const color of sameProductColors) {
    if (items.length >= Math.min(MAX_SAME_PRODUCT, max)) break;
    items.push({ product: current, color });
    usedColors.add(color);
  }

  const others = PRODUCTS.filter((p) => p.slug !== current.slug && p.colorsLinea.length > 0);
  const byGsmProximity = (a: Product, b: Product) =>
    Math.abs(a.gsm - current.gsm) - Math.abs(b.gsm - current.gsm);

  // 2. Familia cercana — mismo fit, distinta referencia.
  const family = others.filter((p) => p.fit === current.fit).sort(byGsmProximity);
  let familyCount = 0;
  for (const product of family) {
    if (items.length >= max || familyCount >= MAX_FAMILY) break;
    if (usedSlugs.has(product.slug)) continue;
    items.push({ product, color: pickColor(product) });
    usedSlugs.add(product.slug);
    familyCount++;
  }

  // 3. Complementaria — otra línea, gramaje más cercano primero.
  const complementary = others.filter((p) => p.fit !== current.fit).sort(byGsmProximity);
  for (const product of complementary) {
    if (items.length >= max) break;
    if (usedSlugs.has(product.slug)) continue;
    items.push({ product, color: pickColor(product) });
    usedSlugs.add(product.slug);
  }

  return items;
}
