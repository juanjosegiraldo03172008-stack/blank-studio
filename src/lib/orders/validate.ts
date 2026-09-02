import {
  PRODUCTS,
  allColorsFor,
  getUnitPrice,
  isSizeAvailable,
  type Product,
} from "@/data/products";
import type {
  CreateOrderCustomerInput,
  CreateOrderFieldErrors,
  CreateOrderInput,
} from "./types";

/** Tope técnico de seguridad — no una regla de negocio real. Bloquea
 * cantidades corruptas/abusivas sin limitar un pedido legítimo grande. */
const MAX_QUANTITY_PER_ITEM = 20;
const MAX_ITEMS_PER_ORDER = 40;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidatedItem {
  product: Product;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ValidationSuccess {
  ok: true;
  customer: Required<Omit<CreateOrderCustomerInput, "addressLine2">> & {
    addressLine2: string | null;
  };
  items: ValidatedItem[];
  subtotal: number;
}

export interface ValidationFailure {
  ok: false;
  error: string;
  fieldErrors?: CreateOrderFieldErrors;
}

/**
 * Valida y recalcula TODO server-side. El cliente solo puede influir en
 * slug/color/size/quantity — cualquier precio, nombre de producto o total
 * que venga en el payload se ignora por completo; nunca se lee.
 */
export function validateCreateOrderInput(
  input: unknown,
): ValidationSuccess | ValidationFailure {
  if (
    typeof input !== "object" ||
    input === null ||
    !("customer" in input) ||
    !("items" in input) ||
    !("idempotencyKey" in input)
  ) {
    return { ok: false, error: "Solicitud inválida." };
  }
  const body = input as CreateOrderInput;

  if (
    typeof body.idempotencyKey !== "string" ||
    body.idempotencyKey.trim() === ""
  ) {
    return { ok: false, error: "Solicitud inválida." };
  }

  const fieldErrors: CreateOrderFieldErrors = {};
  const customer = body.customer;

  if (typeof customer !== "object" || customer === null) {
    return { ok: false, error: "Datos de contacto inválidos." };
  }

  const name = typeof customer.name === "string" ? customer.name.trim() : "";
  const email = typeof customer.email === "string" ? customer.email.trim() : "";
  const phone = typeof customer.phone === "string" ? customer.phone.trim() : "";
  const city = typeof customer.city === "string" ? customer.city.trim() : "";
  const address =
    typeof customer.address === "string" ? customer.address.trim() : "";
  const addressLine2 =
    typeof customer.addressLine2 === "string" &&
    customer.addressLine2.trim() !== ""
      ? customer.addressLine2.trim()
      : null;

  if (!name) fieldErrors.name = "Ingresa tu nombre completo.";
  if (!email) fieldErrors.email = "Ingresa tu correo.";
  else if (!EMAIL_RE.test(email))
    fieldErrors.email = "Ingresa un correo válido.";
  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone) fieldErrors.phone = "Ingresa tu teléfono.";
  else if (phoneDigits.length < 7)
    fieldErrors.phone = "Ingresa un teléfono válido.";
  if (!city) fieldErrors.city = "Ingresa tu ciudad.";
  if (!address) fieldErrors.address = "Ingresa tu dirección de envío.";

  if (!Array.isArray(body.items) || body.items.length === 0) {
    fieldErrors.items = "Tu carrito está vacío.";
  } else if (body.items.length > MAX_ITEMS_PER_ORDER) {
    fieldErrors.items = "El pedido tiene demasiadas referencias distintas.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Revisa los campos marcados.", fieldErrors };
  }

  const items: ValidatedItem[] = [];
  for (const raw of body.items) {
    if (typeof raw !== "object" || raw === null) {
      return {
        ok: false,
        error: "Uno de los productos del carrito es inválido.",
      };
    }
    const { slug, color, size, quantity } = raw as unknown as Record<
      string,
      unknown
    >;

    if (typeof slug !== "string") {
      return { ok: false, error: "Referencia de producto inválida." };
    }
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product) {
      return {
        ok: false,
        error: `El producto "${slug}" ya no existe en el catálogo.`,
      };
    }

    if (
      typeof color !== "string" ||
      !allColorsFor(product).includes(color as never)
    ) {
      return { ok: false, error: `Color inválido para ${product.name}.` };
    }

    if (
      typeof size !== "string" ||
      !isSizeAvailable(product, size as never, color as never)
    ) {
      return {
        ok: false,
        error: `Talla inválida para ${product.name} en ese color.`,
      };
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > MAX_QUANTITY_PER_ITEM
    ) {
      return {
        ok: false,
        error: `Cantidad inválida para ${product.name} (debe ser un entero entre 1 y ${MAX_QUANTITY_PER_ITEM}).`,
      };
    }

    // Único lugar donde se lee el precio — siempre desde products.ts,
    // nunca desde el payload del cliente.
    const unitPrice = getUnitPrice(product.line);
    if (unitPrice === null) {
      return {
        ok: false,
        error: `${product.name} no tiene precio disponible todavía.`,
      };
    }

    items.push({
      product,
      color,
      size,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return {
    ok: true,
    customer: { name, email, phone, city, address, addressLine2 },
    items,
    subtotal,
  };
}
