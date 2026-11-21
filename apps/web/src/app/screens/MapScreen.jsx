import { MapView } from '@/features/map';

export function MapScreen({ city, focus, active = true, onExited }) {
  return <MapView city={city} focus={focus} active={active} onExited={onExited} />;
}
