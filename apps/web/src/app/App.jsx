import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { CitySwitcher, useCities } from '@/features/cities';
import { CityMap } from '@/features/map';
import { ModuleStatusList } from './ModuleStatusList.jsx';

const DEFAULT_CITY = 'cancun';

export function App() {
  const { status, cities, error, reload } = useCities();
  const [cityId, setCityId] = useState(DEFAULT_CITY);
  const city = cities.find((c) => c.id === cityId) ?? cities[0];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div>
          <h1 className="text-xl font-black tracking-tight">
            kindhop<span className="text-accent">.</span>
          </h1>
          <p className="text-xs text-ink-2">Muévete, descubre y cuida tu presupuesto</p>
        </div>
        {status === 'ready' && <CitySwitcher cities={cities} value={city.id} onChange={setCityId} />}
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-3 p-3 md:p-6" aria-busy={status === 'loading'}>
        {status === 'loading' && <p className="p-6 text-center text-sm text-ink-2">Cargando ciudades…</p>}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center">
            <p className="font-medium">{error.message}</p>
            <p className="text-sm text-ink-2">Comprueba que la API esté corriendo (npm run dev).</p>
            <button type="button" onClick={reload} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 font-semibold text-accent-ink">
              <RotateCw aria-hidden="true" size={16} /> Reintentar
            </button>
          </div>
        )}

        {status === 'ready' && city && (
          <>
            <h2 className="text-2xl font-semibold tracking-tight">{city.name}</h2>
            <div className="h-[60dvh]">
              <CityMap city={city} />
            </div>
            <section aria-labelledby="layers-title" className="rounded-2xl bg-surface p-4 ring-1 ring-line">
              <h3 id="layers-title" className="mb-3 font-semibold">Capas de {city.name}</h3>
              <ModuleStatusList modules={city.modules} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
