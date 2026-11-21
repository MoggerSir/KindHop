import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { TABS } from '../navigation/tabs.js';

// Barra inferior fija (zona del pulgar), sobria: tinta para la pestaña activa y un filete que se desliza bajo su etiqueta
// (layoutId); las demás en tinta clara. Sin píldoras ni color de acento.
export function BottomNav({ current, onNavigate }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ id, Icon }) => {
          const active = id === current;
          return (
            <li key={id}>
              <motion.button
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                whileTap={press}
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1.5 transition-colors duration-150 ${active ? 'text-accent' : 'text-ink-2 hover:text-ink'}`}
              >
                <Icon aria-hidden="true" size={22} strokeWidth={active ? 2 : 1.5} />
                <span className="relative pb-1 text-xs font-medium">
                  {t(`nav.${id}`)}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={spring.snappy}
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent shadow-glow-accent"
                    />
                  )}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
