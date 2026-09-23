import {
  DELIVERY_MODES,
  DELIVERY_MODE_LABELS,
  type DeliveryMode,
} from "@/data/shipping";

/**
 * Selector de modalidad de entrega (P0-B3) — compartido por /pedido y por
 * "Solicitar otra opción de envío" en /pedido/[id]. Radios nativos: teclado
 * y lectores de pantalla funcionan sin JavaScript adicional.
 */
export default function DeliveryModeSelector({
  name,
  value,
  onChange,
  error,
}: {
  name: string;
  value: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="label text-ink/50">Modalidad de entrega *</legend>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DELIVERY_MODES.map((mode) => {
          const selected = value === mode;
          return (
            <label
              key={mode}
              className={`flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm transition-colors ${
                selected ? "border-ink" : "border-line hover:border-ink/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={mode}
                checked={selected}
                onChange={() => onChange(mode)}
                className="mt-0.5 accent-ink"
              />
              <span>{DELIVERY_MODE_LABELS[mode]}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-[#b23328]">{error}</p>}
    </fieldset>
  );
}
