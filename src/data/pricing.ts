/**
 * Precios reales tomados del catálogo VALENCIANO 2024 (COP).
 * Estructura de venta por escalas de cantidad (mayor a menor precio):
 *
 *   mayorista24   → 24 o más unidades del mismo diseño/color
 *   emprendedor12 → 12 a 23 unidades
 *   pionero6      → 6 a 11 unidades
 *   visionario3   → 3 a 5 unidades
 *   detal         → 1 a 2 unidades (precio al detal)
 *
 * La talla 2XL tiene una tabla de precio distinta (más alta) y solo
 * existe en Essentials 200 y Oversize 200.
 */
export interface PriceTiers {
  mayorista24: number;
  emprendedor12: number;
  pionero6: number;
  visionario3: number;
  detal: number;
}

export const TIER_LABELS: { key: keyof PriceTiers; label: string; min: number }[] = [
  { key: "detal", label: "Detal (1-2 und)", min: 1 },
  { key: "visionario3", label: "Visionario (3-5 und)", min: 3 },
  { key: "pionero6", label: "Pionero (6-11 und)", min: 6 },
  { key: "emprendedor12", label: "Emprendedor (12-23 und)", min: 12 },
  { key: "mayorista24", label: "Mayorista (24+ und)", min: 24 },
];

export function tierForQuantity(qty: number): keyof PriceTiers {
  if (qty >= 24) return "mayorista24";
  if (qty >= 12) return "emprendedor12";
  if (qty >= 6) return "pionero6";
  if (qty >= 3) return "visionario3";
  return "detal";
}

export const PRICING: Record<
  "essentials-200" | "essentials-300" | "oversize-200" | "oversize-300",
  { base: PriceTiers; xxl: PriceTiers | null }
> = {
  "essentials-200": {
    base: {
      mayorista24: 26000,
      emprendedor12: 27000,
      pionero6: 28000,
      visionario3: 31000,
      detal: 35000,
    },
    xxl: {
      mayorista24: 33000,
      emprendedor12: 34000,
      pionero6: 35000,
      visionario3: 38000,
      detal: 42000,
    },
  },
  "essentials-300": {
    base: {
      mayorista24: 37000,
      emprendedor12: 38000,
      pionero6: 39000,
      visionario3: 43000,
      detal: 50000,
    },
    xxl: null,
  },
  "oversize-300": {
    base: {
      mayorista24: 41000,
      emprendedor12: 42000,
      pionero6: 43000,
      visionario3: 51000,
      detal: 56000,
    },
    xxl: null,
  },
  "oversize-200": {
    base: {
      mayorista24: 32000,
      emprendedor12: 33000,
      pionero6: 34000,
      visionario3: 38000,
      detal: 43000,
    },
    xxl: {
      mayorista24: 36000,
      emprendedor12: 37000,
      pionero6: 38000,
      visionario3: 42000,
      detal: 47000,
    },
  },
};
