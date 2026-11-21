import { useI18n } from '@/shared/i18n';

// Etiqueta visible de procedencia de un dato. Obligatoria en todo dato mostrado en mapa o listas.
// Monocroma como el resto del sistema: REAL en verde gris, lo demás en tinta. `onImage`: cartulina opaca sobre fotos.
const TONE = {
  REAL: 'text-success',
  DEMO: 'text-ink',
  USER_REPORTED: 'text-ink-2',
  UNVERIFIED: 'text-ink-2',
};

export function DataStatusBadge({ status, onImage = false }) {
  const { t } = useI18n();
  const known = status in TONE ? status : 'UNVERIFIED';
  return (
    <span className={`label inline-flex items-center rounded-control px-1.5 py-1 !text-[0.625rem] shadow-[inset_0_0_0_1px_var(--color-line-strong)] ${onImage ? 'bg-surface' : 'bg-transparent'} ${TONE[known]}`}>
      {t(`dataStatus.${known}`)}
    </span>
  );
}
