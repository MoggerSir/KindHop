import { Star } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

// Calificación con estrellas (0–5). Si rating es null/undefined, muestra estado honesto sin inventar puntuación.
// compact: píldora corta ("★ 4.8") para tarjetas de evento; default: estilo mapa ("4.8 ★★★★★ (64)").
export function StarRating({ rating, count, compact = false, onImage = false, className = '' }) {
  const { t } = useI18n();
  const hasRating = typeof rating === 'number' && Number.isFinite(rating);

  if (!hasRating) {
    if (compact) return null;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-ink-3 ${className}`}>
        <Star aria-hidden="true" size={13} strokeWidth={1.5} />
        {t('rating.none')}
      </span>
    );
  }

  const score = rating.toFixed(1);
  const filled = Math.round(rating);
  const aria = count != null ? t('rating.ariaWithCount', { score, count }) : t('rating.aria', { score });

  if (compact) {
    return (
      <span
        aria-label={aria}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] font-medium tabular-nums ${
          onImage ? 'bg-scrim text-ink backdrop-blur-md' : 'border border-line bg-tint text-ink'
        } ${className}`}
      >
        <Star aria-hidden="true" size={11} strokeWidth={1.5} className="fill-current text-accent" />
        {score}
      </span>
    );
  }

  return (
    <span aria-label={aria} className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <span className="font-mono font-semibold tabular-nums text-ink">{score}</span>
      <span aria-hidden="true" className="inline-flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={13}
            strokeWidth={1.5}
            className={i < filled ? 'fill-current text-accent' : 'text-ink-3'}
          />
        ))}
      </span>
      {count != null && <span className="font-mono tabular-nums text-ink-2">({count})</span>}
    </span>
  );
}
