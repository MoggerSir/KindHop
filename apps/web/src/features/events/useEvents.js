import { useI18n } from '@/shared/i18n';
import { useResource } from '@/shared/hooks/useResource.js';
import { fetchEvents } from './events.api.js';

// Estado: { status: 'loading' | 'error' | 'ready', events, error, reload } de la ciudad activa.
const EMPTY = [];

export function useEvents(city) {
  const { locale } = useI18n();
  const { data, ...state } = useResource(fetchEvents, { cityId: city.id, locale });
  return { ...state, events: data ?? EMPTY };
}
