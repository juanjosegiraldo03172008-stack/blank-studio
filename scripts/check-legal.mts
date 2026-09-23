// Verifica manualmente los datos legales del vendedor (LEGAL_*) antes de
// publicar fases que los muestren. Uso: `npm run check:legal`
//   --show  imprime también los valores normalizados (solo en tu terminal).
//
// Requiere Node >= 22.6 (ejecuta TypeScript sin compilar, sin dependencias).
// Lee las variables del entorno y, sin sobrescribirlas, de los archivos
// .env.production.local, .env.local, .env.production y .env — el mismo orden
// de prioridad que usa Next.js en producción.

import { existsSync } from "node:fs";
import {
  SELLER_ENV_VARS,
  parseSellerIdentity,
  type SellerField,
} from "../src/lib/legal/sellerIdentity.ts";

const ENV_FILES = [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
];

for (const file of ENV_FILES) {
  // process.loadEnvFile no sobrescribe variables ya definidas: el entorno
  // real y el primer archivo que defina una variable tienen prioridad.
  if (existsSync(file)) process.loadEnvFile(file);
}

const showValues = process.argv.includes("--show");
const result = parseSellerIdentity(process.env);

const issuesByField = new Map<SellerField, { errors: string[]; warnings: string[] }>();
for (const field of Object.keys(SELLER_ENV_VARS) as SellerField[]) {
  issuesByField.set(field, { errors: [], warnings: [] });
}
if (!result.ok) {
  for (const e of result.errors) issuesByField.get(e.field)!.errors.push(e.message);
}
for (const w of result.warnings) issuesByField.get(w.field)!.warnings.push(w.message);

console.log("Datos legales del vendedor (LEGAL_*)\n");
for (const [field, { errors, warnings }] of issuesByField) {
  const variable = SELLER_ENV_VARS[field];
  const mark = errors.length > 0 ? "✗" : warnings.length > 0 ? "!" : "✓";
  console.log(`  ${mark} ${variable}`);
  for (const m of errors) console.log(`      error: ${m}`);
  for (const m of warnings) console.log(`      advertencia: ${m}`);
}

if (!result.ok) {
  console.log(
    `\nFALLA: ${result.errors.length} error(es). No publiques páginas que usen estos datos hasta corregirlos.`,
  );
  process.exit(1);
}

if (showValues) {
  const id = result.identity;
  console.log("\nValores normalizados:");
  console.log(`  Nombre:    ${id.name}`);
  console.log(`  NIT:       ${id.nit}`);
  console.log(`  Dirección: ${id.noticeAddress}`);
  console.log(`  Ciudad:    ${id.city}`);
  console.log(`  Teléfono:  ${id.phone}`);
  console.log(`  Correo:    ${id.email}`);
}

console.log(
  result.warnings.length > 0
    ? `\nOK con ${result.warnings.length} advertencia(s): revísalas antes de publicar.`
    : "\nOK: formato válido. Recuerda que esto valida formato, no qué dato corresponde publicar legalmente.",
);
