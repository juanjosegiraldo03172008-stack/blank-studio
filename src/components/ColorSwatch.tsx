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
  size?: "sm" | "md";
  onClick?: () => void;
}) {
  const meta = COLORS[color];
  const dims = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? `${meta.name} (no disponible en esta talla)` : meta.name}
      aria-label={meta.name}
      aria-pressed={selected}
      className={`group relative flex items-center justify-center rounded-full transition ${
        disabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
      }`}
    >
      <span
        className={`${dims} rounded-full ring-1 ring-inset ring-black/10 transition-transform ${
          selected ? "scale-90 ring-2 ring-ink" : "group-hover:scale-105"
        }`}
        style={{ backgroundColor: meta.hex }}
      />
      {selected && (
        <span className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-ink" />
      )}
    </button>
  );
}
