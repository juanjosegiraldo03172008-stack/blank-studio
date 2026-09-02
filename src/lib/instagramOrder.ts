import { COLORS, formatCOP } from "@/data/products";
import type { CartItemWithPrice } from "@/context/CartContext";

export const INSTAGRAM_HANDLE = "valenciano.co";
/** ig.me abre directo el chat interno con la cuenta, no el perfil. */
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`;

export interface CustomerInfo {
  name: string;
  city: string;
  address: string;
  /** Apto, torre, interior, etc. — opcional. */
  addressLine2?: string;
  phone: string;
  notes?: string;
}

export function buildOrderMessage(
  items: CartItemWithPrice[],
  customer: CustomerInfo,
): string {
  const lines: string[] = [];
  lines.push("Hola VALENCIANO, quiero hacer este pedido:");
  lines.push("");
  items.forEach((item, idx) => {
    const colorName = COLORS[item.color].name;
    const priceLabel =
      item.unitPrice === null ? "Próximamente" : formatCOP(item.unitPrice);
    lines.push(
      `${idx + 1}. ${item.name} — Color: ${colorName} — Talla: ${item.size} — Cant: ${item.quantity} — ${priceLabel} c/u`,
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
  const address = customer.addressLine2
    ? `${customer.address}, ${customer.addressLine2}`
    : customer.address;
  lines.push(`Dirección: ${address}`);
  lines.push(`Teléfono: ${customer.phone}`);
  if (customer.notes) lines.push(`Notas: ${customer.notes}`);
  return lines.join("\n");
}

/** @returns true si el texto quedó realmente en el portapapeles. */
export async function copyOrderAndOpenInstagram(
  message: string,
): Promise<boolean> {
  // window.open debe llamarse de forma síncrona, en la misma tarea que el
  // gesto del usuario (el click) — si se llama después de un await, algunos
  // navegadores (y Safari en particular) ya no lo asocian al gesto y
  // bloquean el popup. El portapapeles sí puede esperar.
  window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch {
    // clipboard puede fallar (permisos/contexto no seguro) — Instagram ya
    // se abrió; el llamador debe avisar que hay que copiar a mano.
    return false;
  }
}
