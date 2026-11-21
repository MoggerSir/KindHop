import { ModuleStatusList } from '@/features/cities';
import { CityMap } from '@/features/map';
import { useI18n } from '@/shared/i18n';

// Pestaña Mapa: mapa de la ciudad y estado honesto de sus capas. Aquí se montan las capas de cada feature
// (transporte, lugares, incidencias…); cada una recibe `city` y decide sola qué pedir.
export function MapScreen({ city }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3">
      <h2 className="text-2xl font-extrabold tracking-tight">{city.name}</h2>
      <div className="h-[60dvh]">
        <CityMap city={city} />
      </div>
      <section aria-labelledby="layers-title" className="rounded-3xl bg-surface p-4 ring-1 ring-line">
        <h3 id="layers-title" className="mb-3 font-semibold">
          {t('cities.layersTitle', { city: city.name })}
        </h3>
        <ModuleStatusList modules={city.modules} />
      </section>
    </div>
  );
}
