import { http } from '@/shared/lib/http';

// Contrato: GET /api/cities/:cityId/events -> { events: Event[] } (ver docs/04-api/contract.md).
export async function fetchEvents({ cityId, locale, signal, fresh }) {
  const data = await http(`/api/cities/${encodeURIComponent(cityId)}/events?lang=${encodeURIComponent(locale)}`, { signal, fresh });
  return data.events;
}
