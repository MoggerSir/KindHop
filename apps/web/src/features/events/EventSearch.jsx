import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarX2, Search, SearchX, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EmptyState } from '@/shared/components/EmptyState.jsx';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press, spring, stageItem, stagger } from '@/shared/motion/motion.js';
import { EventCard } from './EventCard.jsx';
import { EventDetail } from './EventDetail.jsx';
import { WHEN, searchEvents, suggestions } from './search.js';
import { useEvents } from './useEvents.js';

const URL_DELAY = 300; // ms sin teclear antes de guardar el texto en la URL y anunciar el recuento

// Buscador de Explorar: campo de texto + "cuándo" (todo / hoy / esta semana) sobre los eventos de la ciudad.
// Los resultados cambian al instante al escribir; la URL y el anuncio para lector de pantalla esperan a que se deje de
// teclear. Controlado por la ruta: `query`, `category`, `when` vienen de la URL y `onChange(patch, { replace })` la cambia.
// `filters`: los chips de categoría (los pone la pantalla). Abrir un resultado expande su fila hasta el detalle.
export function EventSearch({ city, query, category, when, onChange, filters, renderPlaces }) {
  const { t } = useI18n();
  const { status, events, error, reload } = useEvents(city);
  const input = useRef(null);
  const [text, setText] = useState(query);
  const sent = useRef(query);
  const [announced, setAnnounced] = useState(query);
  const [open, setOpen] = useState(null);
  const [returning, setReturning] = useState(null);
  const closeDetail = useCallback(() => {
    setReturning(open?.id ?? null);
    setOpen(null);
  }, [open]);
  const period = WHEN.includes(when) ? when : 'all';

  // La URL cambió desde fuera (atrás del navegador, enlace compartido): el campo la sigue.
  useEffect(() => {
    if (query !== sent.current) {
      sent.current = query;
      setText(query);
    }
  }, [query]);

  // Al dejar de teclear: texto a la URL (sin llenar el historial) y recuento al lector de pantalla.
  useEffect(() => {
    const id = setTimeout(() => {
      setAnnounced(text);
      if (text !== sent.current) {
        sent.current = text;
        onChange({ q: text.trim() ? text : null }, { replace: true });
      }
    }, URL_DELAY);
    return () => clearTimeout(id);
  }, [text, onChange]);

  // Atajo "/" para ir al buscador desde cualquier parte de la pantalla.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categoryLabel = (id) => t(`discovery.categories.${id}`);
  const results = status === 'ready' ? searchEvents(events, { query: text, category, when: period, timeZone: city.timezone, categoryLabel }) : [];
  const filtering = Boolean(text.trim() || category || period !== 'all');
  const count = (n) => t(n === 1 ? 'explore.resultsOne' : 'explore.results', { count: n });
  const clearAll = () => {
    setText('');
    sent.current = '';
    onChange({ q: null, category: null, when: null });
  };

  const reduce = useReducedMotion();
  const stage = reduce ? fadeOnly : stageItem;

  return (
    <motion.div variants={stagger(0.1)} initial="hidden" animate="visible" className="grid gap-4 [&>*]:min-w-0">
      <motion.search variants={stage} role="search" aria-label={t('explore.searchLabel')}>
        <form onSubmit={(e) => (e.preventDefault(), input.current?.blur())} className="relative">
          <label htmlFor="explore-q" className="sr-only">
            {t('explore.searchLabel')}
          </label>
          <Search aria-hidden="true" size={20} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-2" />
          <input
            ref={input}
            id="explore-q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && text && (e.preventDefault(), setText(''))}
            placeholder={t('explore.placeholder')}
            className="h-14 w-full rounded-card border border-line bg-sunk pr-14 pl-12 text-base text-ink shadow-sunk transition-[border-color] duration-150 placeholder:text-ink-2 hover:border-line-strong focus:border-accent focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {text ? (
            <motion.button
              type="button"
              onClick={() => (setText(''), input.current?.focus())}
              aria-label={t('explore.clear')}
              whileTap={press}
              className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-control text-ink-2 transition-colors duration-150 hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.5} />
            </motion.button>
          ) : (
            <kbd aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-control border border-line-strong px-1.5 font-mono text-xs text-ink-2 pointer-fine:block">
              /
            </kbd>
          )}
        </form>
      </motion.search>

      <motion.div variants={stage}>{filters}</motion.div>

      <motion.fieldset variants={stage} className="grid grid-cols-3 gap-1 rounded-card border border-line bg-sunk p-1 shadow-sunk">
        <legend className="sr-only">{t('explore.whenLabel')}</legend>
        {WHEN.map((id) => {
          const selected = period === id;
          return (
            <label
              key={id}
              className={`relative flex min-h-11 cursor-pointer items-center justify-center rounded-control text-sm font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${selected ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
            >
              {selected && <motion.span layoutId="explore-when" transition={spring.snappy} aria-hidden="true" className="absolute inset-0 rounded-control bg-surface shadow-embossed" />}
              <input type="radio" name="explore-when" value={id} checked={selected} onChange={() => onChange({ when: id === 'all' ? null : id })} className="sr-only" />
              <span className="relative">{t(`explore.when.${id}`)}</span>
            </label>
          );
        })}
      </motion.fieldset>

      <motion.section variants={stage} aria-labelledby="explore-results" aria-busy={status === 'loading'} className="grid gap-3 [&>*]:min-w-0">
        <div className="-my-2 flex min-h-11 items-center justify-between gap-3">
          <h2 id="explore-results" className="text-xs font-medium text-ink-3">
            {filtering && status === 'ready' ? count(results.length) : t('home.recommended')}
          </h2>
          {filtering && (
            <button
              type="button"
              onClick={clearAll}
              className="-mr-2 min-h-11 rounded-control px-2 text-xs font-medium text-accent transition-colors duration-150 hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-accent"
            >
              {t('explore.clearAll')}
            </button>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {status === 'ready' && announced === text ? count(results.length) : ''}
        </p>

        {status === 'loading' && <LoadingState>{t('events.loading')}</LoadingState>}
        {status === 'error' && <ErrorState error={error} onRetry={reload} />}
        {status === 'ready' && events.length === 0 && <EmptyState icon={CalendarX2}>{t('explore.emptyCity', { city: city.name })}</EmptyState>}
        {status === 'ready' && events.length > 0 && results.length === 0 && (renderPlaces ? (
          <p className="rounded-control border border-line bg-sunk px-4 py-3 text-sm text-ink-2">{t('explore.noEvents')}</p>
        ) : (
          <EmptyState
            icon={SearchX}
            title={text.trim() ? t('explore.noResultsFor', { query: text.trim() }) : t('explore.noResults')}
            actions={
              <>
                {suggestions(events).map((venue) => (
                  <motion.button
                    key={venue}
                    type="button"
                    whileTap={press}
                    onClick={() => {
                      setText(venue);
                      onChange({ category: null, when: null });
                    }}
                    className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-ink transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {venue}
                  </motion.button>
                ))}
              </>
            }
          >
            {t(category && !events.some((e) => e.category === category) ? 'explore.noCategory' : 'explore.tryOther', { category: category ? categoryLabel(category) : '' })}
          </EmptyState>
        ))}

        {results.length > 0 && (
          <ul className="grid gap-2.5 [&>li]:min-w-0">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((event, index) => (
                <motion.li
                  key={event.id}
                  layout
                  transition={spring.layout}
                  variants={fadeOnly}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: 'relative', zIndex: returning === event.id ? 10 : 0 }}
                >
                  {open?.id === event.id ? (
                    <div aria-hidden="true" className="h-28 short:h-24" />
                  ) : (
                    <EventCard
                      event={event}
                      timeZone={city.timezone}
                      variant="row"
                      priority={index === 0}
                      query={text}
                      onOpen={setOpen}
                      returning={returning === event.id}
                      onSettled={() => returning === event.id && setReturning(null)}
                    />
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.section>

      {renderPlaces && <motion.div variants={stage}>{renderPlaces(text)}</motion.div>}

      <AnimatePresence>{open && <EventDetail key={open.id} event={open} timeZone={city.timezone} onClose={closeDetail} />}</AnimatePresence>
    </motion.div>
  );
}
