import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronUp, Compass, Minimize2 } from 'lucide-react';
import { PlaceDetailSheet } from '@/features/discovery';
import { TransitCredit } from '@/features/transit';
import { WeekStrip, EventDetailSheet, dayKey } from '@/features/events';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { expand, fadeOnly, press, spring, stageItem } from '@/shared/motion/motion.js';
import { CityMap } from './CityMap.jsx';
import { useMapData } from './useMapData.js';
import { useGeolocation } from './useGeolocation.js';
import { MapControls } from './MapControls.jsx';
import { LayerPanel } from './LayerPanel.jsx';
import { DataLayers } from './DataLayers.jsx';
import { EventPins, UserDot } from './EventPins.jsx';
import { EventRow, PoiRow, RouteRow, ZoneRow, EventCardSelected, PlaceGroupCard, PoiCard, RouteCard, ZoneCard } from './MapItems.jsx';
import { eventsOnDay, groupEventsByPlace, distanceMeters, formatDistance, geometryBounds } from './geo.js';
import { cameraOptions } from './mapTheme.js';

const EMPTY = [];
const INITIAL_LIMITS = { events: 2, businesses: 3, pois: 3, transit: 3, districts: 3 };
const PAGE_STEP = 4;
const SECTION_CHIPS = ['all', 'events', 'businesses', 'pois', 'transit', 'districts'];

export function MapView({ city, focus = null }) {
  const { t, locale, has } = useI18n();
  const reduce = useReducedMotion();
  const errorText = (error) => t(has(`errors.${error?.code}`) ? `errors.${error.code}` : 'errors.UNKNOWN');
  const [map, setMap] = useState(null);
  const [enabled, setEnabled] = useState({ events: true, pois: true, transit: true, districts: true });
  const [panel, setPanel] = useState(false);
  const [docked, setDocked] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const [day, setDay] = useState(null);
  const [selection, setSelection] = useState(null);
  const [detail, setDetail] = useState(null);
  const [poiDetail, setPoiDetail] = useState(null);
  const [cityId, setCityId] = useState(city.id);
  if (cityId !== city.id) {
    setCityId(city.id);
    setSelection(null);
    setDetail(null);
    setPoiDetail(null);
    setDay(null);
    setSectionFilter('all');
    setLimits(INITIAL_LIMITS);
  }
  const resources = useMapData(city);
  const geo = useGeolocation();
  const events = useMemo(
    () => eventsOnDay(resources.events.events, day, (iso) => dayKey(new Date(iso), city.timezone)),
    [resources.events.events, day, city.timezone],
  );
  const eventGroups = useMemo(() => groupEventsByPlace(events), [events]);
  const pois = resources.pois.data?.pois ?? EMPTY;
  const { businesses, spots, poiById } = useMemo(() => {
    const biz = [];
    const rest = [];
    const byId = new Map();
    for (const p of pois) {
      byId.set(String(p.id), p);
      if (p.category === 'markets') biz.push(p);
      else rest.push(p);
    }
    return { businesses: biz, spots: rest, poiById: byId };
  }, [pois]);
  const routes = resources.transit.data?.routes ?? EMPTY;
  const districts = resources.districts.data;
  const zones = districts?.features ?? EMPTY;

  useEffect(() => {
    if (!map || !routes.length) return;
    const bounds = geometryBounds({ coordinates: routes.map((route) => route.geometry.coordinates) });
    if (bounds) map.fitBounds(bounds, { padding: 40, maxZoom: 13, ...cameraOptions() });
  }, [map, routes, city.id]);

  const distanceTo = (coordinates) =>
    geo.position && coordinates ? t('map.distance', { distance: formatDistance(distanceMeters(geo.position, coordinates), locale) }) : null;

  const focusedRef = useRef(null);
  const select = useCallback(
    (kind, item) => {
      setDocked(false);
      setSelection({ kind, item });
      const center = item.coordinates ?? item.place?.coordinates;
      const bounds = geometryBounds(item.geometry);
      if (bounds) map?.fitBounds(bounds, { padding: 36, ...cameraOptions() });
      if (center) map?.flyTo({ center, zoom: Math.max(map.getZoom(), 15), ...cameraOptions() });
    },
    [map],
  );

  useEffect(() => {
    if (!map || !focus || focusedRef.current === focus) return;
    if (focus.startsWith('poi:')) {
      const target = poiById.get(focus.slice(4));
      if (target) {
        focusedRef.current = focus;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- enfoca el lugar pedido desde Inicio al cargar POI
        select('pois', target);
      }
    }
  }, [map, focus, poiById, select]);

  const layers = ['events', 'pois', 'transit', 'districts'].map((id) => {
    const resource = resources[id];
    const items = id === 'events' ? events : id === 'pois' ? pois : id === 'transit' ? routes : zones;
    return {
      id,
      on: enabled[id],
      status: city.modules[id] !== 'IMPLEMENTED' ? 'unavailable' : resource.status,
      count: items.length,
      source: resource.data?.source,
      error: resource.error,
      reload: resource.reload,
    };
  });

  const sections = useMemo(() => {
    const byId = Object.fromEntries(layers.map((l) => [l.id, l]));
    return [
      { id: 'events', layer: byId.events, items: events },
      { id: 'businesses', layer: byId.pois, items: businesses },
      { id: 'pois', layer: byId.pois, items: spots },
      { id: 'transit', layer: byId.transit, items: routes },
      { id: 'districts', layer: byId.districts, items: zones },
    ].filter((s) => s.layer.on && (sectionFilter === 'all' || sectionFilter === s.id));
  }, [layers, events, businesses, spots, routes, zones, sectionFilter]);

  const clear = () => setSelection(null);
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setSelection(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const selected = selection?.item;
  const counts = useMemo(() => {
    const mapCounts = {};
    for (const event of resources.events.events) {
      const key = dayKey(new Date(event.startsAt), city.timezone);
      mapCounts[key] = (mapCounts[key] ?? 0) + 1;
    }
    return mapCounts;
  }, [resources.events.events, city.timezone]);

  const sheetTransition = reduce ? { duration: 0.15 } : spring.morph;

  return (
    <motion.section variants={fadeOnly} initial="hidden" animate="visible" className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-[calc(4rem+env(safe-area-inset-bottom))] z-0 overflow-hidden bg-paper">
      <h2 className="sr-only">{t('map.title', { city: city.name })}</h2>

      <div className="absolute inset-0">
        <CityMap city={city} onReady={setMap}>
          {map && (
            <>
              <DataLayers map={map} pois={pois} routes={routes} districts={districts} enabled={enabled} onSelect={select} onClear={clear} selection={selection} />
              {enabled.events && (
                <EventPins
                  map={map}
                  groups={eventGroups}
                  selectedPlaceId={selected?.place?.id}
                  onSelect={(group) => select(group.events.length > 1 ? 'eventPlace' : 'events', group.events.length > 1 ? group : group.events[0])}
                  onOpen={(group) => (group.events.length === 1 ? setDetail(group.events[0]) : select('eventPlace', group))}
                  distanceTo={distanceTo}
                />
              )}
              {geo.position && <UserDot map={map} position={geo.position} />}
              <motion.div
                variants={reduce ? fadeOnly : stageItem}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.18 }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2"
              >
                <MapControls
                  map={map}
                  geoStatus={geo.status}
                  located={Boolean(geo.position)}
                  onLocate={async () => {
                    const position = await geo.locate();
                    if (position) map.flyTo({ center: position, zoom: 14, ...cameraOptions() });
                  }}
                />
              </motion.div>
            </>
          )}
        </CityMap>
        <motion.div
          variants={reduce ? fadeOnly : stageItem}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.14 }}
          className="absolute top-20 right-3 z-30"
        >
          <LayerPanel
            city={city}
            layers={layers}
            open={panel}
            onOpenChange={setPanel}
            onToggle={(id) => {
              setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
              clear();
            }}
          />
        </motion.div>
      </div>

      {/* Tira de días con scroll horizontal (12 días: incluye 29 y 30) */}
      <motion.div
        variants={reduce ? fadeOnly : stageItem}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.05 }}
        className="absolute inset-x-3 top-3 z-10 mx-auto max-w-md overflow-hidden rounded-sheet bg-surface shadow-floating"
      >
        <WeekStrip timeZone={city.timezone} value={day} onChange={(key) => { setDay(key); clear(); }} allLabel={t('map.allDays')} counts={counts} days={12} name="map-day" className="" />
      </motion.div>

      {/* Hoja inferior colapsable hacia icono circular en la esquina inferior derecha (sin estiramiento en escritorio) */}
      <AnimatePresence mode="wait" initial={false}>
        {docked ? (
          <motion.button
            key="map-sheet-fab"
            type="button"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.72 }}
            transition={reduce ? { duration: 0.15 } : spring.snappy}
            whileTap={press}
            onClick={() => setDocked(false)}
            aria-label={t('map.openSheet')}
            className="absolute right-3 bottom-3 z-20 grid size-14 origin-bottom-right place-items-center rounded-full bg-accent text-on-accent shadow-solid transition-colors duration-150 hover:bg-accent-hover"
          >
            <Compass aria-hidden="true" size={24} strokeWidth={1.75} />
          </motion.button>
        ) : (
          <motion.section
            key="map-sheet-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 18 }}
            transition={sheetTransition}
            className="absolute inset-x-3 bottom-3 z-20 mx-auto flex max-h-[68%] max-w-xl origin-bottom-right flex-col overflow-hidden rounded-sheet border border-line-strong bg-surface shadow-floating sm:inset-x-auto sm:right-3 sm:mx-0 sm:w-[26rem]"
          >
            <div className="flex shrink-0 items-center gap-1 px-2">
              <motion.button
                type="button"
                whileTap={press}
                aria-expanded={listOpen}
                aria-controls="map-items"
                onClick={() => setListOpen((open) => !open)}
                className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 px-2 text-sm font-semibold text-ink"
              >
                <span aria-hidden="true" className="h-1 w-10 rounded-full bg-ink-3" />
                <span className="flex w-full items-center justify-between gap-2">
                  {t(listOpen ? 'map.collapseList' : 'map.expandList')}
                  <motion.span aria-hidden="true" animate={{ rotate: listOpen ? 180 : 0 }} transition={spring.snappy} className="grid">
                    <ChevronUp size={18} strokeWidth={1.5} />
                  </motion.span>
                </span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={press}
                onClick={() => {
                  setListOpen(false);
                  setDocked(true);
                }}
                aria-label={t('map.minimizeSheet')}
                className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-tint hover:text-ink"
              >
                <Minimize2 aria-hidden="true" size={17} strokeWidth={1.5} />
              </motion.button>
            </div>

            <div id="map-items" className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3">
              <p role="status" className="mb-2 text-xs text-ink-2">{t(`map.geo.${geo.status}`)}</p>

              {selection?.kind === 'eventPlace' && (
                <PlaceGroupCard group={selected} distance={distanceTo(selected.place.coordinates)} onClear={clear}>
                  {selected.events.map((event) => (
                    <EventRow key={event.id} event={event} timeZone={city.timezone} onSelect={setDetail} />
                  ))}
                </PlaceGroupCard>
              )}
              {selection?.kind === 'events' && (
                <EventCardSelected event={selected} timeZone={city.timezone} distance={distanceTo(selected.place?.coordinates)} onOpen={setDetail} onClear={clear} />
              )}
              {selection?.kind === 'pois' && (
                <PoiCard poi={selected} source={resources.pois.data?.source} distance={distanceTo(selected.coordinates)} onOpen={setPoiDetail} onClear={clear} />
              )}
              {selection?.kind === 'transit' && (
                <RouteCard route={selected} source={resources.transit.data?.source} onClear={clear} />
              )}
              {selection?.kind === 'districts' && (
                <ZoneCard zone={selected.properties} source={districts?.source} onClear={clear} />
              )}

              {!selection && !listOpen && (
                resources.events.status === 'loading' ? (
                  <p role="status" className="text-sm text-ink-2">{t('common.loading')}</p>
                ) : resources.events.status === 'error' ? (
                  <p role="alert" className="text-sm text-danger">
                    {errorText(resources.events.error)}{' '}
                    <button type="button" onClick={resources.events.reload} className="min-h-11 underline">{t('common.retry')}</button>
                  </p>
                ) : events[0] ? (
                  <EventRow event={events[0]} timeZone={city.timezone} onSelect={(event) => select('events', event)} />
                ) : (
                  <p className="text-sm text-ink-2">{t('map.layers.empty.events')}</p>
                )
              )}

              <AnimatePresence initial={false}>
                {listOpen && (
                  <motion.div
                    key="map-list-expanded"
                    variants={reduce ? fadeOnly : expand}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="grid gap-4 overflow-hidden pt-1"
                    aria-label={t('map.listLabel')}
                  >
                    {/* Chips de filtro por sección */}
                    <div role="group" aria-label={t('map.filtersLabel')} className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]">
                      {SECTION_CHIPS.map((id) => {
                        const active = sectionFilter === id;
                        return (
                          <motion.button
                            key={id}
                            type="button"
                            whileTap={press}
                            aria-pressed={active}
                            onClick={() => setSectionFilter(id)}
                            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 ${
                              active
                                ? 'border-accent bg-accent text-on-accent shadow-solid'
                                : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink'
                            }`}
                          >
                            {t(`map.sections.${id}`)}
                          </motion.button>
                        );
                      })}
                    </div>

                    {sections.map(({ id, layer, items }) => {
                      const limit = limits[id] ?? 3;
                      const visibleItems = items.slice(0, limit);
                      const hasMore = visibleItems.length < items.length;
                      return (
                        <section key={id} className="grid gap-1.5 border-t border-line pt-3" aria-busy={layer.status === 'loading'}>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-ink">{t(`map.sections.${id}`)}</h3>
                            {layer.status === 'ready' && (
                              <span className="font-mono text-xs text-ink-3 tabular-nums">{items.length}</span>
                            )}
                          </div>
                          {id === 'transit' && city.id === 'cdmx' && layer.source && <TransitCredit source={layer.source} routes={routes} />}
                          {(id !== 'transit' || city.id !== 'cdmx') && layer.source && (
                            <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-ink-2">
                              <DataStatusBadge status={layer.source.dataStatus} />
                              {[layer.source.name, layer.source.license].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {layer.status === 'loading' && <p className="text-sm text-ink-2">{t('common.loading')}</p>}
                          {layer.status === 'unavailable' && <p className="text-sm text-ink-2">{t(`map.layers.why.${layer.id}`, { city: city.name })}</p>}
                          {layer.status === 'error' && (
                            <p role="alert" className="text-sm text-danger">
                              {errorText(layer.error)}{' '}
                              <button type="button" className="min-h-11 underline" onClick={layer.reload}>{t('common.retry')}</button>
                            </p>
                          )}
                          {layer.status === 'ready' && items.length === 0 && (
                            <p className="text-sm text-ink-2">{t(id === 'events' && day ? 'map.noDayEvents' : `map.layers.empty.${layer.id}`)}</p>
                          )}
                          {id === 'events' && visibleItems.map((event) => (
                            <EventRow key={event.id} event={event} timeZone={city.timezone} distance={distanceTo(event.place?.coordinates)} selected={selected?.id === event.id} onSelect={(item) => select('events', item)} />
                          ))}
                          {(id === 'businesses' || id === 'pois') && visibleItems.map((poi) => (
                            <PoiRow key={poi.id} poi={poi} distance={distanceTo(poi.coordinates)} selected={selected?.id === poi.id} onSelect={(item) => select('pois', item)} />
                          ))}
                          {id === 'transit' && visibleItems.map((route) => (
                            <RouteRow key={route.id} route={route} selected={selected?.id === route.id} onSelect={(item) => select('transit', item)} />
                          ))}
                          {id === 'districts' && visibleItems.map((zone) => (
                            <ZoneRow key={zone.properties.id} zone={zone.properties} selected={selected?.properties?.id === zone.properties.id} onSelect={() => select('districts', zone)} />
                          ))}
                          {hasMore && (
                            <motion.button
                              type="button"
                              whileTap={press}
                              onClick={() => setLimits((prev) => ({ ...prev, [id]: (prev[id] ?? 3) + PAGE_STEP }))}
                              className="mx-auto inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-3 transition-colors duration-150 hover:text-ink"
                            >
                              {t('events.seeMore')}
                            </motion.button>
                          )}
                        </section>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <EventDetailSheet event={detail} timeZone={city.timezone} onClose={() => setDetail(null)} />
      <PlaceDetailSheet poi={poiDetail} city={city} source={resources.pois.data?.source} onClose={() => setPoiDetail(null)} />
    </motion.section>
  );
}
