import Image from "next/image";

/** Isotipo "BS" real de BLANK STUDIO, extraído del catálogo oficial. */
export default function BrandMark({
  variant = "black",
  size = 22,
  className = "",
}: {
  variant?: "black" | "white";
  size?: number;
  className?: string;
}) {
  const src = variant === "white" ? "/logo-mark-white.png" : "/logo-mark-black.png";
  // aspect ratio ~1578:2243
  const width = Math.round(size * (1578 / 2243));
  return (
    <Image
      src={src}
      alt="BLANK STUDIO"
      width={width}
      height={size}
      className={className}
      priority
    />
  );
}
