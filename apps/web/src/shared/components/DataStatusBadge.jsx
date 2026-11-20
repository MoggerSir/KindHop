// Etiqueta visible de procedencia de un dato. Obligatoria en todo dato mostrado en mapa o listas.
const STYLES = {
  REAL: 'bg-status-real/10 text-status-real',
  DEMO: 'bg-status-demo/10 text-status-demo',
  USER_REPORTED: 'bg-status-unverified/10 text-status-unverified',
  UNVERIFIED: 'bg-status-unverified/10 text-status-unverified',
};

export function DataStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${STYLES[status] ?? STYLES.UNVERIFIED}`}>
      {status}
    </span>
  );
}
