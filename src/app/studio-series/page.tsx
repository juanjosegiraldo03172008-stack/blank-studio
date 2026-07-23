import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";

export const metadata: Metadata = {
  title: "Studio Series — En lanzamiento",
  description: "Studio Series — la nueva línea de BLANK STUDIO. En lanzamiento.",
};

export default function StudioSeriesPage() {
  return (
    <section className="relative flex h-[calc(100vh-64px)] min-h-[560px] w-full items-center justify-center overflow-hidden bg-brand-stone">
      <EditorialImage
        src="/upcoming/studio-series-verde.jpg"
        alt="Studio Series"
        priority
        gradient="from-[#1f4f3b] via-[#1b432f] to-[#0f2c21]"
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1 className="font-display text-5xl text-white sm:text-7xl">
          Studio Series
        </h1>
        <p className="label mt-6 text-white/85">En lanzamiento</p>
      </div>
    </section>
  );
}
