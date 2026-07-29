import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";

export const metadata: Metadata = {
  title: "Icon Series — En lanzamiento",
  description: "Icon Series — la nueva línea urbana de VALENCIANO. En lanzamiento.",
};

export default function IconSeriesPage() {
  return (
    <section className="relative flex h-[calc(100vh-64px)] min-h-[560px] w-full items-center justify-center overflow-hidden bg-brand-black">
      <EditorialImage
        src="/upcoming/icon-series.jpg"
        alt="Icon Series"
        priority
        gradient="from-[#1c1b19] via-[#141312] to-[#0c0b0a]"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1 className="font-display text-5xl text-white sm:text-7xl">
          Icon Series
        </h1>
        <p className="label mt-6 text-white/85">En lanzamiento</p>
      </div>
    </section>
  );
}
