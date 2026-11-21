// Estado vacío honesto: explica por qué no hay datos (sin fuente, aún no construido) en vez de dejar un hueco.
export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface px-6 py-10 text-center ring-1 ring-line">
      {Icon && <Icon aria-hidden="true" size={28} strokeWidth={1.75} className="text-accent" />}
      {title && <p className="font-semibold">{title}</p>}
      <p className="max-w-[36ch] text-sm text-pretty text-ink-2">{children}</p>
    </div>
  );
}
