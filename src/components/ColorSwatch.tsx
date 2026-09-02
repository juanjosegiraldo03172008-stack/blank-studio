import { COLORS, type ColorId } from "@/data/products";

export default function ColorSwatch({
  color,
  selected = false,
  disabled = false,
  size = "md",
  onClick,
}: {
  color: ColorId;
  selected?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const meta = COLORS[color];
  const dims = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  // El círculo visible se mantiene compacto en "lg" también; solo el botón
  // crece a ~44px (usado en la PDP) para cumplir el tap target mínimo
  // recomendado en mobile, sin tocar el tamaño visual de "md" (catálogo).
  const hitArea = size === "lg" ? "h-11 w-11" : "";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={
        disabled ? `${meta.name} (no disponible en esta talla)` : meta.name
      }
      aria-label={meta.name}
      aria-pressed={selected}
      className={`group relative flex items-center justify-center rounded-full transition focus-visible:outline-none ${hitArea} ${
        disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
      }`}
    >
      <span
        className={`${dims} rounded-full ring-1 ring-inset ring-black/10 transition-transform ${
          selected ? "scale-90 ring-2 ring-ink" : "group-hover:scale-105"
        }`}
        style={{ backgroundColor: meta.hex }}
      />
      {(selected || !disabled) && (
        <span
          className={`pointer-events-none absolute -inset-1 rounded-full ring-1 ring-ink ${
            selected ? "" : "opacity-0 group-focus-visible:opacity-100"
          }`}
        />
      )}
    </button>
  );
}
