import type { Fit } from "@/data/products";

/**
 * Silueta editorial en línea fina, usada como placeholder de estudio
 * mientras no hay fotografía real del producto. Se reemplaza sola en
 * cuanto exista un archivo real en /public/products/<slug>/.
 */
export default function TShirtSilhouette({
  fit,
  hex,
  variant = 0,
}: {
  fit: Fit;
  hex: string;
  variant?: number;
}) {
  const oversize = fit === "oversize";
  const rotate = [0, -1.5, 1.5, -0.8][variant % 4];
  const scale = [1, 1.03, 0.97, 1.01][variant % 4];

  const path = oversize
    ? "M74 34 L96 20 C112 40 138 40 154 20 L176 34 L188 66 L166 78 L166 216 C166 226 158 234 148 234 L102 234 C92 234 84 226 84 216 L84 78 L62 66 Z"
    : "M82 30 L100 18 C112 36 138 36 150 18 L168 30 L182 60 L162 72 L162 214 C162 224 154 232 144 232 L106 232 C96 232 88 224 88 214 L88 72 L68 60 Z";

  return (
    <svg
      viewBox="0 0 250 250"
      className="h-full w-full"
      style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
      aria-hidden="true"
    >
      <path
        d={path}
        fill={hex}
        fillOpacity={0.94}
        stroke="rgba(15,14,12,0.18)"
        strokeWidth={0.75}
      />
      <path
        d={oversize ? "M96 20 C112 40 138 40 154 20" : "M100 18 C112 36 138 36 150 18"}
        fill="none"
        stroke="rgba(15,14,12,0.22)"
        strokeWidth={0.75}
      />
    </svg>
  );
}
