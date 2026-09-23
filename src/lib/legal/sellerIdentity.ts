/**
 * Datos legales del vendedor (Ley 1480 de 2011, art. 50 lit. a): lectura y
 * validación de FORMATO desde variables de entorno LEGAL_*.
 *
 * Módulo puro a propósito: sin imports y sin leer process.env directamente
 * (recibe el entorno como parámetro). Así lo pueden usar tanto el servidor de
 * Next (src/lib/legal/server.ts) como `npm run check:legal`
 * (scripts/check-legal.mts, ejecutado con Node sin compilar).
 *
 * Esta validación revisa formato y detecta placeholders evidentes. NO decide
 * qué dato debe publicarse legalmente — eso es una decisión del titular con
 * asesoría profesional. Por eso, lo sospechoso pero posible (p. ej. dígitos
 * repetidos) es una ADVERTENCIA, no un error.
 *
 * Los valores nunca se incluyen en los mensajes de error/advertencia.
 */

export const SELLER_ENV_VARS = {
  name: "LEGAL_SELLER_NAME",
  nit: "LEGAL_SELLER_NIT",
  noticeAddress: "LEGAL_NOTICE_ADDRESS",
  city: "LEGAL_CITY",
  phone: "LEGAL_PHONE",
  email: "LEGAL_EMAIL",
} as const;

export type SellerField = keyof typeof SELLER_ENV_VARS;

export interface SellerIdentity {
  /** Nombre o razón social del vendedor, tal como se configuró (espacios normalizados). */
  name: string;
  /** NIT normalizado "BASE-DV", sin puntos (p. ej. formato NNNNNNNNN-D). */
  nit: string;
  /** Dirección de notificación judicial. */
  noticeAddress: string;
  city: string;
  /** Teléfono tal como se configuró (espacios normalizados), para mostrarlo. */
  phone: string;
  /** Solo dígitos del teléfono, para enlaces tel:. */
  phoneDigits: string;
  email: string;
}

export interface SellerIdentityIssue {
  field: SellerField;
  variable: string;
  message: string;
}

export type SellerIdentityResult =
  | { ok: true; identity: SellerIdentity; warnings: SellerIdentityIssue[] }
  | {
      ok: false;
      errors: SellerIdentityIssue[];
      warnings: SellerIdentityIssue[];
    };

const MAX_LENGTH = 200;

/**
 * Palabras típicas de valores de ejemplo/relleno. Se comparan como palabras
 * completas, sin tildes y sin distinguir mayúsculas.
 */
const PLACEHOLDER_WORDS = [
  "ejemplo",
  "example",
  "placeholder",
  "pendiente",
  "ficticio",
  "ficticia",
  "lorem",
  "ipsum",
  "dummy",
  "sample",
  "changeme",
  "cambiar",
  "completar",
  "rellenar",
  "tbd",
  "test",
  "prueba",
  "null",
  "undefined",
];
const PLACEHOLDER_RE = new RegExp(
  `(^|[^a-z0-9])(${PLACEHOLDER_WORDS.join("|")}|x{3,}|n/a)($|[^a-z0-9])`,
);

/** Dominios reservados para ejemplos/pruebas (RFC 2606 / RFC 6761). */
const RESERVED_EMAIL_DOMAIN_RE =
  /(^|\.)(example\.(com|net|org)|example|test|invalid|localhost)$/;

// Pesos oficiales del algoritmo de dígito de verificación (módulo 11) de la
// DIAN, aplicados de derecha a izquierda sobre la base del NIT.
const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/**
 * Dígito de verificación de un NIT colombiano (algoritmo módulo 11 de la
 * DIAN). `base` debe contener solo dígitos (máximo 15).
 */
export function nitCheckDigit(base: string): number {
  if (!/^\d{1,15}$/.test(base)) {
    throw new Error("La base del NIT debe tener entre 1 y 15 dígitos.");
  }
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    const digit = Number(base[base.length - 1 - i]);
    sum += digit * NIT_WEIGHTS[i];
  }
  const remainder = sum % 11;
  return remainder > 1 ? 11 - remainder : remainder;
}

function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Minúsculas y sin tildes — solo para comparar, nunca para mostrar. */
function foldForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function looksLikePlaceholder(value: string): boolean {
  const folded = foldForComparison(value);
  if (PLACEHOLDER_RE.test(folded)) return true;
  // Plantillas del tipo <nombre>, {valor}, [dato].
  if (/[<>{}[\]]/.test(value)) return true;
  // Solo signos (p. ej. "-", "...", "***").
  if (!/[\p{L}\p{N}]/u.test(value)) return true;
  // Un mismo carácter repetido (p. ej. "aaaa").
  if (/^(.)\1+$/u.test(value.replace(/\s/g, ""))) return true;
  return false;
}

function isAllSameDigit(digits: string): boolean {
  return /^(\d)\1+$/.test(digits);
}

function isSequentialDigits(digits: string): boolean {
  if (digits.length < 6) return false;
  return (
    "01234567890123456789".includes(digits) ||
    "98765432109876543210".includes(digits)
  );
}

type FieldCheck = {
  value?: string;
  errors: string[];
  warnings: string[];
};

function checkName(raw: string): FieldCheck {
  const value = normalizeSpaces(raw);
  const errors: string[] = [];
  if (value.length < 3) errors.push("es demasiado corto.");
  if (!/\p{L}/u.test(value)) errors.push("debe contener letras.");
  return { value, errors, warnings: [] };
}

function checkNit(raw: string): FieldCheck & { base?: string; dv?: string } {
  const compact = raw.replace(/\s+/g, "");
  const match = /^(\d{1,3}(?:\.\d{3})+|\d+)-(\d)$/.exec(compact);
  if (!match) {
    return {
      errors: [
        "formato inválido: usa solo dígitos (puntos opcionales cada tres) y el dígito de verificación separado por guion, con el formato NNNNNNNNN-D.",
      ],
      warnings: [],
    };
  }
  const base = match[1].replace(/\./g, "");
  const dv = match[2];
  const errors: string[] = [];
  const warnings: string[] = [];
  if (base.length < 4 || base.length > 15) {
    errors.push("la base del NIT debe tener entre 4 y 15 dígitos.");
  } else if (/^0+$/.test(base)) {
    errors.push("la base del NIT no puede ser solo ceros.");
  } else if (nitCheckDigit(base) !== Number(dv)) {
    errors.push(
      "el dígito de verificación no corresponde a la base según el algoritmo de la DIAN.",
    );
  }
  if (errors.length === 0) {
    if (isAllSameDigit(base) || isSequentialDigits(base)) {
      warnings.push(
        "la base tiene dígitos repetidos o consecutivos; confirma que no sea un valor de ejemplo.",
      );
    }
  }
  return { value: `${base}-${dv}`, base, dv, errors, warnings };
}

function checkAddress(raw: string): FieldCheck {
  const value = normalizeSpaces(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (value.length < 5) errors.push("es demasiado corta.");
  if (!/\p{L}/u.test(value)) errors.push("debe contener letras.");
  if (errors.length === 0 && !/\d/.test(value)) {
    warnings.push(
      "no contiene números; confirma que la dirección esté completa.",
    );
  }
  return { value, errors, warnings };
}

function checkCity(raw: string): FieldCheck {
  const value = normalizeSpaces(raw);
  const errors: string[] = [];
  if (value.length < 2) errors.push("es demasiado corta.");
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(value)) {
    errors.push("solo puede contener letras, espacios, puntos, apóstrofes y guiones.");
  }
  return { value, errors, warnings: [] };
}

function checkPhone(raw: string): FieldCheck & { digits?: string } {
  const value = normalizeSpaces(raw);
  if (!/^\+?[\d\s().-]+$/.test(value)) {
    return {
      errors: [
        "solo puede contener dígitos, espacios, paréntesis, guiones y un + inicial.",
      ],
      warnings: [],
    };
  }
  const digits = value.replace(/\D/g, "");
  const errors: string[] = [];
  const warnings: string[] = [];
  if (digits.length < 7 || digits.length > 15) {
    errors.push("debe tener entre 7 y 15 dígitos.");
  } else if (/0{7,}/.test(digits) || /^0+$/.test(digits)) {
    errors.push("parece un número de ejemplo (demasiados ceros seguidos).");
  }
  if (errors.length === 0) {
    const national =
      digits.length === 12 && digits.startsWith("57")
        ? digits.slice(2)
        : digits;
    const isColombianMobile = /^3\d{9}$/.test(national);
    const isColombianLandline = /^60\d{8}$/.test(national);
    if (!isColombianMobile && !isColombianLandline) {
      warnings.push(
        "no coincide con un celular (3XX XXX XXXX) ni con un fijo (60X XXX XXXX) de Colombia; confirma el número.",
      );
    }
    // Los últimos 7 dígitos son el número de abonado en ambos formatos.
    const subscriber = national.slice(-7);
    if (isAllSameDigit(subscriber) || isSequentialDigits(subscriber)) {
      warnings.push(
        "tiene dígitos repetidos o consecutivos; confirma que no sea un valor de ejemplo.",
      );
    }
  }
  return { value, digits, errors, warnings };
}

function checkEmail(raw: string): FieldCheck {
  const value = raw.trim();
  const errors: string[] = [];
  const at = value.split("@");
  if (/\s/.test(value) || at.length !== 2) {
    return {
      errors: ["formato de correo inválido."],
      warnings: [],
    };
  }
  const [local, domainRaw] = at;
  const domain = domainRaw.toLowerCase();
  const localOk =
    local.length >= 1 &&
    local.length <= 64 &&
    /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..");
  const labels = domain.split(".");
  const domainOk =
    domain.length <= 253 &&
    labels.length >= 2 &&
    labels.every((l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l)) &&
    /^[a-z]{2,}$/.test(labels[labels.length - 1]);
  if (!localOk || !domainOk || value.length > 254) {
    errors.push("formato de correo inválido.");
  } else if (RESERVED_EMAIL_DOMAIN_RE.test(domain)) {
    errors.push("usa un dominio reservado para ejemplos o pruebas.");
  }
  return { value: `${local}@${domain}`, errors, warnings: [] };
}

/**
 * Lee y valida LEGAL_* desde `env`. Nunca lanza: devuelve errores y
 * advertencias por variable (sin incluir los valores).
 */
export function parseSellerIdentity(
  env: Readonly<Record<string, string | undefined>>,
): SellerIdentityResult {
  const errors: SellerIdentityIssue[] = [];
  const warnings: SellerIdentityIssue[] = [];
  const values: Partial<Record<SellerField, FieldCheck & { digits?: string }>> =
    {};

  const checkers: Record<
    SellerField,
    (raw: string) => FieldCheck & { digits?: string }
  > = {
    name: checkName,
    nit: checkNit,
    noticeAddress: checkAddress,
    city: checkCity,
    phone: checkPhone,
    email: checkEmail,
  };

  for (const field of Object.keys(SELLER_ENV_VARS) as SellerField[]) {
    const variable = SELLER_ENV_VARS[field];
    const raw = env[variable];
    const issue = (message: string) => ({ field, variable, message });

    if (raw === undefined) {
      errors.push(issue("no está definida."));
      continue;
    }
    if (raw.trim() === "") {
      errors.push(issue("está vacía."));
      continue;
    }
    if (raw.length > MAX_LENGTH) {
      errors.push(issue(`supera ${MAX_LENGTH} caracteres.`));
      continue;
    }
    if (/[\u0000-\u001f\u007f]/.test(raw)) {
      errors.push(issue("contiene saltos de línea o caracteres de control."));
      continue;
    }
    if (looksLikePlaceholder(raw)) {
      errors.push(
        issue("parece un valor de ejemplo o de relleno; usa el dato real."),
      );
      continue;
    }

    const result = checkers[field](raw);
    for (const message of result.errors) errors.push(issue(message));
    for (const message of result.warnings) warnings.push(issue(message));
    values[field] = result;
  }

  if (errors.length > 0) return { ok: false, errors, warnings };

  const v = values as Record<SellerField, FieldCheck & { digits?: string }>;
  return {
    ok: true,
    warnings,
    identity: {
      name: v.name.value!,
      nit: v.nit.value!,
      noticeAddress: v.noticeAddress.value!,
      city: v.city.value!,
      phone: v.phone.value!,
      phoneDigits: v.phone.digits!,
      email: v.email.value!,
    },
  };
}
