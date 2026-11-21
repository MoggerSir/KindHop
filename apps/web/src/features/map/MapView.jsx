import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { TransitCredit } from '@/features/transit';
import { WeekStrip, EventDetailSheet, dayKey } from '@/features/events';
import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly, press } from '@/shared/motion/motion.js';
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
export function MapView({ city }) {
  const { t, locale, has } = useI18n();
  const errorText = (error) => t(has(`errors.${error?.code}`) ? `errors.${error.code}` : 'errors.UNKNOWN');
  const [map, setMap] = useState(null);
  const [enabled, setEnabled] = useState({ events: true, pois: true, transit: true, districts: true });
  const [panel, setPanel] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [day, setDay] = useState(null);
  const [selection, setSelection] = useState(null);
  const [detail, setDetail] = useState(null);
  const [cityId, setCityId] = useState(city.id);
  if (cityId !== city.id) { setCityId(city.id); setSelection(null); setDetail(null); setDay(null); }
  const resources = useMapData(city);
  const geo = useGeolocation();
  const events = eventsOnDay(resources.events.events, day, (iso) => dayKey(new Date(iso), city.timezone));
  const pois = resources.pois.data?.pois ?? EMPTY;
  const routes = resources.transit.data?.routes ?? EMPTY;
  const districts = resources.districts.data;
  const zones = districts?.features ?? EMPTY;
  useEffect(() => {
    if (!map || !routes.length) return;
    const bounds = geometryBounds({ coordinates: routes.map((route) => route.geometry.coordinates) });
    if (bounds) map.fitBounds(bounds, { padding: 40, maxZoom: 13, ...cameraOptions() });
  }, [map, routes, city.id]);
  const distanceTo = (coordinates) => geo.position && coordinates ? t('map.distance', { distance: formatDistance(distanceMeters(geo.position, coordinates), locale) }) : null;
  const select = (kind, item) => {
    setSelection({ kind, item });
    const center = item.coordinates ?? item.place?.coordinates;
    const bounds = geometryBounds(item.geometry);
    if (bounds) map?.fitBounds(bounds, { padding: 36, ...cameraOptions() });
    if (center) map?.flyTo({ center, zoom: Math.max(map.getZoom(), 14), ...cameraOptions() });
  };
  const layers = ['events', 'pois', 'transit', 'districts'].map((id) => {
    const resource = resources[id];
    const items = id === 'events' ? events : id === 'pois' ? pois : id === 'transit' ? routes : zones;
    return { id, on: enabled[id], status: city.modules[id] !== 'IMPLEMENTED' ? 'unavailable' : resource.status, count: items.length, source: resource.data?.source, error: resource.error, reload: resource.reload };
  });
  const clear = () => setSelection(null);
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') setSelection(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  const selected = selection?.item;
  const counts = {};
  for (const event of resources.events.events) {
    const key = dayKey(new Date(event.startsAt), city.timezone);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return (
    <motion.section variants={fadeOnly} initial="hidden" animate="visible" className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-[calc(4rem+env(safe-area-inset-bottom))] z-0 overflow-hidden bg-paper">
      <h2 className="sr-only">{t('map.title', { city: city.name })}</h2>

      <div className="absolute inset-0">
        <CityMap city={city} onReady={setMap}>
          {map && <>
            <DataLayers map={map} pois={pois} routes={routes} districts={districts} enabled={enabled} onSelect={select} onClear={clear} selection={selection} />
            {enabled.events && <EventPins map={map} groups={groupEventsByPlace(events)} selectedPlaceId={selected?.place?.id} onSelect={(group) => select(group.events.length > 1 ? 'eventPlace' : 'events', group.events.length > 1 ? group : group.events[0])} onOpen={(group) => group.events.length === 1 ? setDetail(group.events[0]) : select('eventPlace', group)} distanceTo={distanceTo} />}
            {geo.position && <UserDot map={map} position={geo.position} />}
            <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2"><MapControls map={map} geoStatus={geo.status} located={Boolean(geo.position)} onLocate={async () => { const position = await geo.locate(); if (position) map.flyTo({ center: position, zoom: 14, ...cameraOptions() }); }} /></div>
          </>}
        </CityMap>
        <div className="absolute top-20 right-3 z-30"><LayerPanel city={city} layers={layers} open={panel} onOpenChange={setPanel} onToggle={(id) => { setEnabled((prev) => ({ ...prev, [id]: !prev[id] })); clear(); }} /></div>
      </div>
      <div className="absolute inset-x-3 top-3 z-10 mx-auto max-w-md rounded-sheet bg-surface shadow-floating">
<WeekStrip timeZone={city.timezone} value={day} onChange={(key) => { setDay(key); clear(); }} allLabel={t('map.allDays')} counts={counts} name="map-day" className="" />
      </div>
      <section className="absolute inset-x-3 bottom-3 z-20 mx-auto flex max-h-[65%] max-w-xl flex-col overflow-hidden rounded-sheet border border-line-strong bg-surface shadow-floating">
        <motion.button type="button" whileTap={press} aria-expanded={listOpen} aria-controls="map-items" onClick={() => setListOpen((open) => !open)} className="flex min-h-14 w-full shrink-0 flex-col items-center justify-center gap-1 px-4 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-ink-3" />
          <span className="flex w-full items-center justify-between gap-3">{t(listOpen ? 'map.collapseList' : 'map.expandList')}<ChevronUp aria-hidden="true" size={18} strokeWidth={1.5} className={listOpen ? 'rotate-180' : ''} /></span>
        </motion.button>
        <div id="map-items" className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3">
      <p role="status" className="mb-2 text-xs text-ink-2">{t(`map.geo.${geo.status}`)}</p>
      {selection?.kind === 'eventPlace' && <PlaceGroupCard group={selected} distance={distanceTo(selected.place.coordinates)} onClear={clear}>{selected.events.map((event) => <EventRow key={event.id} event={event} timeZone={city.timezone} onSelect={setDetail} />)}</PlaceGroupCard>}
      {selection?.kind === 'events' && <EventCardSelected event={selected} timeZone={city.timezone} distance={distanceTo(selected.place?.coordinates)} onOpen={setDetail} onClear={clear} />}
      {selection?.kind === 'pois' && <PoiCard poi={selected} source={resources.pois.data?.source} distance={distanceTo(selected.coordinates)} onClear={clear} />}
      {selection?.kind === 'transit' && <RouteCard route={selected} source={resources.transit.data?.source} onClear={clear} />}
      {selection?.kind === 'districts' && <ZoneCard zone={selected.properties} source={districts?.source} onClear={clear} />}
      {!selection && !listOpen && (resources.events.status === 'loading' ? <p role="status" className="text-sm text-ink-2">{t('common.loading')}</p> : resources.events.status === 'error' ? <p role="alert" className="text-sm text-danger">{errorText(resources.events.error)} <button type="button" onClick={resources.events.reload} className="min-h-11 underline">{t('common.retry')}</button></p> : events[0] ? <EventRow event={events[0]} timeZone={city.timezone} onSelect={(event) => select('events', event)} /> : <p className="text-sm text-ink-2">{t('map.layers.empty.events')}</p>)}
      {listOpen && <div className="grid gap-3" aria-label={t('map.listLabel')}>
        {layers.filter((layer) => layer.on).map((layer) => <section key={layer.id} className="rounded-card border border-line bg-surface p-3" aria-busy={layer.status === 'loading'}>
          <h3 className="mb-2 font-semibold text-ink">{t(`cities.modules.${layer.id}`)}</h3>
          {layer.id === 'transit' && city.id === 'cdmx' && layer.source && <TransitCredit source={layer.source} routes={routes} />}
          {(layer.id !== 'transit' || city.id !== 'cdmx') && layer.source && <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-ink-2"><DataStatusBadge status={layer.source.dataStatus} />{[layer.source.name, layer.source.license, layer.source.retrievedAt].filter(Boolean).join(' · ')}</p>}
          {layer.status === 'loading' && <p className="text-sm text-ink-2">{t('common.loading')}</p>}
          {layer.status === 'unavailable' && <p className="text-sm text-ink-2">{t(`map.layers.why.${layer.id}`, { city: city.name })}</p>}
          {layer.status === 'error' && <p role="alert" className="text-sm text-danger">{errorText(layer.error)} <button type="button" className="min-h-11 underline" onClick={layer.reload}>{t('common.retry')}</button></p>}
          {layer.status === 'ready' && layer.count === 0 && <p className="text-sm text-ink-2">{t(layer.id === 'events' && day ? 'map.noDayEvents' : `map.layers.empty.${layer.id}`)}</p>}
          {layer.id === 'events' && events.map((event) => <EventRow key={event.id} event={event} timeZone={city.timezone} distance={distanceTo(event.place?.coordinates)} selected={selected?.id === event.id} onSelect={(item) => select('events', item)} />)}
          {layer.id === 'pois' && pois.map((poi) => <PoiRow key={poi.id} poi={poi} selected={selected?.id === poi.id} onSelect={(item) => select('pois', item)} />)}
          {layer.id === 'transit' && routes.map((route) => <RouteRow key={route.id} route={route} selected={selected?.id === route.id} onSelect={(item) => select('transit', item)} />)}
          {layer.id === 'districts' && zones.map((zone) => <ZoneRow key={zone.properties.id} zone={zone.properties} selected={selected?.properties?.id === zone.properties.id} onSelect={() => select('districts', zone)} />)}
        </section>)}
      </div>}
        </div>
      </section>
      <EventDetailSheet event={detail} timeZone={city.timezone} onClose={() => setDetail(null)} />
    </motion.section>
  );
}
