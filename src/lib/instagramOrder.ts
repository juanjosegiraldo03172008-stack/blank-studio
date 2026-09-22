/**
 * Instagram es un canal de SOPORTE (ayuda y envío opcional del comprobante
 * de transferencia) — ya no es una ruta de compra desde P0-A. La compra
 * ocurre solo en /pedido → /pedido/[id].
 */

export const INSTAGRAM_HANDLE = "valenciano.co";
/** ig.me abre directo el chat interno con la cuenta, no el perfil. */
export const INSTAGRAM_DM_URL = `https://ig.me/m/${INSTAGRAM_HANDLE}`;

/**
 * Abre el chat de Instagram y copia `message` al portapapeles.
 * @returns true si el texto quedó realmente en el portapapeles — el llamador
 * debe informar al usuario qué ocurrió en ambos casos.
 */
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
    // se abrió; el llamador debe avisar que hay que escribirlo a mano.
    return false;
  }
}
