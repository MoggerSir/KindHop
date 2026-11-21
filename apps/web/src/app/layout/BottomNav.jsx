import { useI18n } from '@/shared/i18n';
import { TABS } from '../navigation/tabs.js';

// Barra inferior fija (zona del pulgar). La pestaña activa lleva aria-current, color de acento y fondo de píldora.
export function BottomNav({ current, onNavigate }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ id, Icon }) => {
          const active = id === current;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-h-16 w-full flex-col items-center justify-center gap-1 text-xs font-semibold ${active ? 'text-accent' : 'text-ink-2 hover:text-ink'}`}
              >
                <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors duration-150 ${active ? 'bg-accent/12' : ''}`}>
                  <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.5 : 2} />
                </span>
                {t(`nav.${id}`)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
