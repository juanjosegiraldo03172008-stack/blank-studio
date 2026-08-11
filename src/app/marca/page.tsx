import type { Metadata } from "next";
import EditorialImage from "@/components/EditorialImage";
import { INSTAGRAM_HANDLE } from "@/lib/instagramOrder";

export const metadata: Metadata = {
  title: "La marca",
  description:
    "VALENCIANO diseña ropa esencial en 100% algodón peruano, con una estética elegante e italiana.",
};

const VALUES = [
  {
    title: "Calidad sobre todo",
    text: "Algodón 100% peruano en 200 y 300 GSM. Colores sólidos que perduran, tela que no se encoge ni se deforma.",
  },
  {
    title: "Elegancia silenciosa",
    text: "Sin saturación visual. Cuando llevamos un gráfico o una marca, es intencional y discreta — nunca el protagonista de la prenda.",
  },
  {
    title: "Atemporal",
    text: "No seguimos tendencias pasajeras. Diseñamos piezas que se quedan en tu clóset por años.",
  },
];

export default function MarcaPage() {
  return (
    <div>
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1c1b19] via-[#141312] to-[#0c0b0a]">
        <div className="relative z-10 flex flex-col items-center px-6 text-center">
          <p className="label text-white/60">Premium Essentials</p>
          <h1 className="font-logo mt-6 text-4xl text-white sm:text-6xl">
            VALENCIANO
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <p className="font-display text-2xl leading-relaxed text-ink/85 sm:text-3xl">
          No competimos por precio. Competimos por elegancia, identidad y
          confianza.
        </p>
        <p className="mt-8 text-sm leading-relaxed text-ink/60">
          VALENCIANO nace para construir una marca de ropa elegante,
          inspirada en el rigor y la sobriedad de las grandes casas de moda
          italianas. Piezas premium confeccionadas con 100% algodón peruano,
          pensadas para quienes valoran la simplicidad, la durabilidad y una
          elegancia que no necesita alzar la voz.
        </p>
      </section>

      <section
        id="valores"
        className="mx-auto grid max-w-5xl scroll-mt-16 grid-cols-1 gap-10 px-5 pb-24 sm:px-8 md:grid-cols-3"
      >
        {VALUES.map((v) => (
          <div key={v.title} className="border-t border-ink/20 pt-6">
            <h3 className="font-display text-xl">{v.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              {v.text}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 items-center gap-10 bg-black/[0.02] px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden justify-self-center lg:order-2 lg:justify-self-end">
          <EditorialImage
            src="/catalog/fabric-texture.jpg"
            alt="Proceso de fabricación VALENCIANO"
            gradient="from-[#5b4433] via-[#4a3626] to-[#2c2018]"
          />
        </div>
        <div className="max-w-lg lg:order-1">
          <p className="label text-ink/40">Cómo se hace</p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">
            El proceso detrás de cada prenda
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink/65">
            Cada prenda se confecciona con 100% algodón peruano — una de las
            fibras de algodón más reconocidas del mundo por su suavidad,
            resistencia y durabilidad. Trabajamos dos gramajes pensados para
            necesidades distintas: 200 GSM, un tejido ligero para el uso
            diario, y 300 GSM, de mayor cuerpo y estructura.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/65">
            Cada lote pasa por control de calidad antes de salir: revisamos
            que la tela no se encoja ni se deforme con el lavado, y que el
            color se mantenga sólido con el tiempo. El corte del cuello, las
            costuras y la caída de la prenda se ajustan según la silueta —
            Essentials (horma normal) u Oversize (silueta amplia, cuello en
            rib) — para que cada línea se vea intencional, nunca genérica.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <p className="label text-ink/40">Para quién</p>
        <h2 className="font-display mt-3 text-3xl sm:text-4xl">
          ¿A quién viste VALENCIANO?
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-ink/65">
          Hombres y mujeres, principalmente entre los 18 y los 35 años, que
          valoran vestir bien sin depender de logos gigantes ni de
          tendencias que pasan de moda en una temporada. Personas que
          prefieren una prenda impecable que combine con todo su clóset, que
          entienden que la elegancia se nota en el detalle — la caída de la
          tela, el gramaje, la consistencia del color — y que se sienten
          identificadas con un estilo sobrio y refinado, cercano al Quiet
          Luxury europeo: elegante sin ser ruidoso.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          Si buscas piezas base para armar un guardarropa versátil en vez de
          comprar por impulso, VALENCIANO está pensado para ti.
        </p>
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
