import "server-only";

import {
  parseSellerIdentity,
  type SellerIdentity,
  type SellerIdentityResult,
} from "./sellerIdentity";

/**
 * SOLO SERVIDOR. Acceso a los datos legales del vendedor (LEGAL_*), que viven
 * en variables de entorno — nunca en el código ni en el repositorio.
 *
 * P0-B2: todavía ninguna página los consume. Cuando lo hagan (P0-B5), esas
 * páginas usarán requireSellerIdentity() y se definirá ahí el bloqueo antes
 * del despliegue. Para revisar los datos manualmente: `npm run check:legal`.
 */
export function getSellerIdentity(): SellerIdentityResult {
  return parseSellerIdentity(process.env);
}

/** Devuelve los datos validados o lanza un error que lista las variables con problemas (sin sus valores). */
export function requireSellerIdentity(): SellerIdentity {
  const result = getSellerIdentity();
  if (!result.ok) {
    const variables = [...new Set(result.errors.map((e) => e.variable))];
    throw new Error(
      `Datos legales del vendedor incompletos o inválidos (${variables.join(", ")}). Ejecuta \`npm run check:legal\` para ver el detalle.`,
    );
  }
  return result.identity;
}
