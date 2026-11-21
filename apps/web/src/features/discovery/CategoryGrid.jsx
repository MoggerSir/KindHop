import { useI18n } from '@/shared/i18n';
import { CATEGORIES } from './categories.js';

// Accesos a Explorar por categoría. onSelect(id) recibe null para "Ver todo" (sin filtro).
export function CategoryGrid({ onSelect }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="categories-title" className="grid gap-2.5">
      <h2 id="categories-title" className="text-lg font-extrabold tracking-tight text-balance">
        {t('discovery.title')}
      </h2>
      <ul className="grid grid-cols-5 gap-2">
        {CATEGORIES.map(({ id, Icon }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id === 'more' ? null : id)}
              className="flex min-h-[clamp(3.75rem,8dvh,4.25rem)] w-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface px-1 text-ink shadow-[0_1px_2px_oklch(0.25_0.03_200/0.08)] ring-1 ring-line hover:ring-accent/40 motion-safe:transition-[scale,box-shadow] motion-safe:duration-150 motion-safe:ease-out motion-safe:active:scale-[0.96]"
            >
              <Icon aria-hidden="true" size={22} strokeWidth={2} className="text-accent" />
              <span className="text-xs font-semibold">{t(`discovery.categories.${id}`)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
