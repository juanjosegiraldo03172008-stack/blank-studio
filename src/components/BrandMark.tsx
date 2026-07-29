/**
 * Marca tipográfica provisional de VALENCIANO — una sola "V" en la fuente
 * editorial de la marca. Sustituir por el isotipo real en cuanto llegue
 * el archivo del logo (debe subirse como adjunto, no pegado en el chat).
 */
export default function BrandMark({
  variant = "black",
  size = 22,
  className = "",
}: {
  variant?: "black" | "white";
  size?: number;
  className?: string;
}) {
  const color = variant === "white" ? "#faf8f4" : "#0f0e0c";
  return (
    <span
      aria-hidden="true"
      className={`font-display inline-block leading-none ${className}`}
      style={{ fontSize: size, color, transform: "translateY(1px)" }}
    >
      V
    </span>
  );
}
