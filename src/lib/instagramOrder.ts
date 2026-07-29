import { COLORS, formatCOP } from "@/data/products";
import type { CartItemWithPrice } from "@/context/CartContext";

export const INSTAGRAM_HANDLE = "valenciano.co";
/** ig.me abre directo el chat interno con la cuenta, no el perfil. */
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`;

export interface CustomerInfo {
  name: string;
  city: string;
  address: string;
  phone: string;
  notes?: string;
}

export function buildOrderMessage(
  items: CartItemWithPrice[],
  customer: CustomerInfo
): string {
  const lines: string[] = [];
  lines.push("Hola VALENCIANO, quiero hacer este pedido:");
  lines.push("");
  items.forEach((item, idx) => {
    const colorName = COLORS[item.color].name;
    const priceLabel =
      item.unitPrice === null ? "Próximamente" : formatCOP(item.unitPrice);
    lines.push(
      `${idx + 1}. ${item.name} — Color: ${colorName} — Talla: ${item.size} — Cant: ${item.quantity} — ${priceLabel} c/u`
    );
  });
  lines.push("");
  const total = items.every((i) => i.unitPrice !== null)
    ? items.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0)
    : null;
  if (total !== null) lines.push(`Total: ${formatCOP(total)}`);
  lines.push("");
  lines.push(`Nombre: ${customer.name}`);
  lines.push(`Ciudad: ${customer.city}`);
  lines.push(`Dirección: ${customer.address}`);
  lines.push(`Teléfono: ${customer.phone}`);
  if (customer.notes) lines.push(`Notas: ${customer.notes}`);
  return lines.join("\n");
}

export async function copyOrderAndOpenInstagram(message: string) {
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    // clipboard can fail (permissions/insecure context) — fallback below still opens IG
  }
  window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");
}
