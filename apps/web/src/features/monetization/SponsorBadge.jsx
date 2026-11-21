import { useI18n } from '@/shared/i18n';

// Etiqueta obligatoria de todo contenido pagado (eventos patrocinados, negocios destacados, anuncios).
// Lo pagado nunca se mezcla sin etiqueta con las recomendaciones explicadas.
export function SponsorBadge({ kind = 'sponsored', rank }) {
  const { t } = useI18n();
  return (
    <span className="label inline-flex items-center rounded-control bg-accent px-1.5 py-1 !text-[0.625rem] font-semibold text-on-accent">
      {rank ? t('monetization.badge.sponsoredRank', { rank }) : t(`monetization.badge.${kind}`)}
    </span>
  );
}
