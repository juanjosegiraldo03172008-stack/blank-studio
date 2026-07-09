import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

export const metadata: Metadata = {
  title: "La marca",
  description:
    "BLANK STUDIO diseña ropa esencial en 100% algodón peruano. Calidad, diseño limpio y quiet luxury.",
};

const VALUES = [
  {
    title: "Calidad sobre todo",
    text: "Algodón 100% peruano en 200 y 300 GSM. Colores sólidos que perduran, tela que no se encoge ni se deforma.",
  },
  {
    title: "Diseño limpio",
    text: "Sin logos gigantes, sin saturación visual. Una prenda que combina con todo, siempre.",
  },
  {
    title: "Atemporal",
    text: "No seguimos tendencias pasajeras. Diseñamos piezas que se quedan en tu clóset por años.",
  },
];

export default function MarcaPage() {
  return (
    <div>
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-brand-black">
        <EditorialImage
          src="/catalog/fabric-bg.jpg"
          alt="BLANK STUDIO"
          gradient="from-[#1c1b19] via-[#141312] to-[#0c0b0a]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6 text-center">
          <p className="label text-white/60">Premium Essentials</p>
          <h1 className="font-display mt-4 text-4xl text-white sm:text-6xl">
            BLANK STUDIO
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <p className="font-display text-2xl leading-relaxed text-ink/85 sm:text-3xl">
          No competimos por precio. Competimos por percepción de calidad,
          identidad y confianza.
        </p>
        <p className="mt-8 text-sm leading-relaxed text-ink/60">
          BLANK STUDIO nace para construir una marca de ropa minimalista
          reconocida por su calidad y su diseño limpio. Camisetas premium
          confeccionadas con 100% algodón peruano, pensadas para quienes
          valoran la simplicidad, la durabilidad y la versatilidad por
          encima de las tendencias pasajeras.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-5 pb-24 sm:px-8 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="border-t border-ink/20 pt-6">
            <h3 className="font-display text-xl">{v.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              {v.text}
            </p>
          </div>
        ))}
      </section>

      <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center sm:px-8">
        <p className="label text-ink/40">Hecho en Perú</p>
        <p className="font-display mt-4 text-2xl sm:text-3xl">
          Envíos a todo Colombia
        </p>
        <a
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="label mt-8 border border-ink px-8 py-4 transition hover:bg-ink hover:text-paper"
        >
          @{INSTAGRAM_HANDLE}
        </a>
      </section>
    </div>
  );
}
