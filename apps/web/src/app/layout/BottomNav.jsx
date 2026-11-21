import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { iconPop, press, spring } from '@/shared/motion/motion.js';
import { warmTab } from '../prefetch.js';
import { TABS } from '../navigation/tabs.js';
import { preloadScreen } from '../screens.js';

// Barra inferior fija (zona del pulgar): la pestaña activa en lima con un filete que se desliza bajo su etiqueta
// (layoutId) y un salto de icono al activarse.
export function BottomNav({ current, onNavigate }) {
  const { t, locale } = useI18n();
  return (
    <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-0 z-20 min-w-0 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ id, Icon }) => {
          const active = id === current;
          return (
            <li key={id} className="min-w-0">
              <motion.button
                type="button"
                onClick={() => onNavigate(id)}
                onPointerDown={() => {
                  preloadScreen(id);
                  warmTab(id, locale);
                }}
                onFocus={() => {
                  preloadScreen(id);
                  warmTab(id, locale);
                }}
                aria-current={active ? 'page' : undefined}
                whileTap={press}
                className={`flex min-h-16 w-full min-w-0 flex-col items-center justify-center gap-1.5 px-1 transition-colors duration-150 ${active ? 'text-accent' : 'text-ink-2 hover:text-ink'}`}
              >
                <motion.span key={String(active)} animate={active ? iconPop : undefined} className="grid">
                  <Icon aria-hidden="true" size={22} strokeWidth={active ? 2 : 1.5} />
                </motion.span>
                {/* Recorta solo el texto: con overflow en este span la línea activa (glow incluido) quedaba cortada. */}
                <span className="relative flex max-w-full min-w-0 pb-1 text-center text-xs font-medium">
                  <span className="min-w-0 truncate">{t(`nav.${id}`)}</span>
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
