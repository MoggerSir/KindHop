import { MapView } from '@/features/map';

export function MapScreen({ city, focus }) {
  return <MapView city={city} focus={focus} />;
}
