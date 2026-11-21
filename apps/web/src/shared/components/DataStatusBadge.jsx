import { useI18n } from '@/shared/i18n';

// Etiqueta visible de procedencia de un dato. Obligatoria en todo dato mostrado en mapa o listas.
// `onImage`: fondo sólido para leerse sobre fotos.
const STYLES = {
  REAL: 'bg-status-real/10 text-status-real',
  DEMO: 'bg-status-demo/10 text-status-demo',
  USER_REPORTED: 'bg-status-unverified/10 text-status-unverified',
  UNVERIFIED: 'bg-status-unverified/10 text-status-unverified',
};

export function DataStatusBadge({ status, onImage = false }) {
  const { t } = useI18n();
  const known = status in STYLES ? status : 'UNVERIFIED';
  const tone = onImage ? `bg-surface ${STYLES[known].split(' ')[1]}` : STYLES[known];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${tone}`}>{t(`dataStatus.${known}`)}</span>;
}
