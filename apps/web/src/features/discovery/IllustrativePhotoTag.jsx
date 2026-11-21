import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';

// Etiqueta sobre una foto genérica de lugar (ADR-0008): la foto es ilustrativa (DEMO), no de ese sitio.
// `compact` (miniatura): solo el badge DEMO visible; el texto completo va para lectores de pantalla.
export function IllustrativePhotoTag({ compact = false }) {
  const { t } = useI18n();
  if (compact) {
    return (
      <span className="absolute bottom-1 left-1">
        <DataStatusBadge status="DEMO" onImage />
        <span className="sr-only">{t('places.illustrativePhoto')}</span>
      </span>
    );
  }
  return (
    <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-scrim px-2 py-0.5 text-[0.6875rem] font-medium text-ink backdrop-blur-md">
      <DataStatusBadge status="DEMO" onImage />
      {t('places.illustrativePhoto')}
    </span>
  );
}
