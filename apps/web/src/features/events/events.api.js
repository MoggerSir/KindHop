import { translate } from '@/shared/i18n';
import { dayKey } from './dates.js';
import { buildDemoEvents } from './events.demo.js';

// Contrato: GET /api/cities/:cityId/events -> { events: Event[] } (ver docs/04-api/contract.md).
// shortcut: devuelve el fixture DEMO; en KH-014 sustituir el cuerpo por
// http(`/api/cities/${cityId}/events`, { signal }).then((data) => data.events) sin tocar componentes.
export async function fetchEvents({ cityId, timeZone, locale }) {
  return buildDemoEvents(cityId, dayKey(new Date(), timeZone), (key) => translate(locale, key));
}
