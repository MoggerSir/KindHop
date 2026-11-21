import { motion } from 'motion/react';
import { useI18n } from '@/shared/i18n';
import { press, spring } from '@/shared/motion/motion.js';
import { TABS } from '../navigation/tabs.js';

// Barra inferior fija (zona del pulgar), sobria: tinta para la pestaña activa y un filete que se desliza bajo su etiqueta
// (layoutId); las demás en tinta clara. Sin píldoras ni color de acento.
export function BottomNav({ current, onNavigate }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t('nav.label')} className="fixed inset-x-0 bottom-0 z-20 bg-paper/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--color-line)] backdrop-blur-md">
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
                className={`flex min-h-16 w-full flex-col items-center justify-center gap-1.5 transition-colors duration-150 ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={active ? 1.75 : 1.5} />
                <span className="label relative pb-1 !text-[0.5625rem] !tracking-[0.08em]">
                  {t(`nav.${id}`)}
                  {active && <motion.span layoutId="nav-underline" transition={spring.snappy} aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-current" />}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
