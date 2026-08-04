const MESSAGES = [
  "100% algodón peruano",
  "Envíos a todo Colombia",
  "Pedidos vía Instagram DM",
  "Hecho para durar",
];

export default function AnnouncementBar() {
  return (
    <div className="flex h-9 items-center overflow-x-auto bg-ink px-4 sm:justify-center">
      <div className="flex items-center gap-3 sm:gap-6">
        {MESSAGES.map((msg, i) => (
          <span key={msg} className="flex items-center gap-3 sm:gap-6">
            {i > 0 && <span className="hidden h-1 w-1 rounded-full bg-paper/40 sm:block" />}
            <span className="label whitespace-nowrap text-paper/80" style={{ fontSize: "0.6875rem" }}>
              {msg}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
