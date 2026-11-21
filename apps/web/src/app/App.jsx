import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginScreen, useSession } from '@/features/auth';
import { CityPicker, useSelectedCity } from '@/features/cities';
import { ErrorState } from '@/shared/components/ErrorState.jsx';
import { LoadingState } from '@/shared/components/LoadingState.jsx';
import { useI18n } from '@/shared/i18n';
import { fadeOnly } from '@/shared/motion/motion.js';
import { AppHeader } from './layout/AppHeader.jsx';
import { BottomNav } from './layout/BottomNav.jsx';
import { useRoute } from './navigation/useRoute.js';
import { warmTab } from './prefetch.js';
import { BudgetScreen, ExploreScreen, HomeScreen, MapScreen } from './screens.js';

// Reserva el alto de la pantalla mientras llega el chunk de la pestaña, para que la cabecera no salte.
function ScreenFallback({ tab }) {
  return (
    <div className={tab === 'map' ? 'min-h-[calc(100dvh-8rem)]' : 'min-h-[70dvh]'} aria-busy="true">
      <LoadingState />
    </div>
  );
}

// Hueco del mapa mientras baja su chunk: mismo lugar y fondo que la sección del mapa. Si el usuario sale de Mapa
// antes de que llegue, avisa igual que MapView al terminar de ocultarse, para que la pestaña nueva aparezca.
function MapFallback({ active, onExited }) {
  useEffect(() => {
    if (!active) onExited?.();
  }, [active, onExited]);
  if (!active) return null;
  return (
    <div className="fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] bottom-[calc(4rem+env(safe-area-inset-bottom))] z-0 bg-paper" aria-busy="true">
      <LoadingState />
    </div>
  );
}

// Puerta de sesión: sin sesión solo existe el login; las pantallas ni se montan (y la API no da datos sin sesión).
export function App() {
  const { t } = useI18n();
  const session = useSession();
  if (session.status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <LoadingState>{t('auth.checking')}</LoadingState>
      </div>
    );
  }
  if (session.status === 'error') {
    return (
      <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
        <ErrorState error={session.error} hint={t('app.apiHint')} onRetry={session.refresh} />
      </div>
    );
  }
  if (session.status !== 'authenticated') return <LoginScreen />;
  return <SignedInApp />;
}

// Composición de la app con sesión: cabecera + pantalla de la pestaña activa + barra inferior. Sin lógica de negocio.
function SignedInApp() {
  const { t, locale } = useI18n();
  const { status, cities, city, error, reload, setCityId } = useSelectedCity();
  const { tab, category, q, when, focus, navigate, setFilters } = useRoute();
  warmTab(tab, locale);
  // `shown` espera a que salga la pantalla anterior (fundido de 150 ms, igual que antes). El mapa, una vez
  // abierto, no se desmonta: ocultarlo conserva el lienzo y las teselas; volver a Mapa solo funde.
  const [shown, setShown] = useState(tab);
  const [mapMounted, setMapMounted] = useState(tab === 'map');
  if (shown === 'map' && !mapMounted) setMapMounted(true);

  const mapActive = shown === 'map' && tab === 'map';
  const onMapExited = () => {
    if (tab !== 'map') setShown(tab);
  };

  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col">
      <AppHeader>{status === 'ready' && city && <CityPicker cities={cities} value={city.id} onChange={setCityId} />}</AppHeader>

      <main className={mapActive ? 'min-h-0 min-w-0 flex-1' : 'mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]'} aria-busy={status === 'loading'}>
        {status === 'loading' && <LoadingState>{t('app.loadingCities')}</LoadingState>}
        {status === 'error' && <ErrorState error={error} hint={t('app.apiHint')} onRetry={reload} />}
        {status === 'ready' && city && (
          // Cambio de pestaña: interacción frecuente, solo un fundido de 150 ms (cada pantalla trae su propia entrada).
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => setShown(tab)}>
            {shown === tab && shown !== 'map' && (
              <motion.div key={shown} variants={fadeOnly} initial="hidden" animate="visible" exit="exit" className="min-w-0">
                <Suspense fallback={<ScreenFallback tab={shown} />}>
                  {shown === 'home' && (
                    <HomeScreen
                      city={city}
                      onExplore={(id) => navigate('explore', { category: id })}
                      onOpenMap={(poi) => navigate('map', { focus: `poi:${poi.id}` })}
                    />
                  )}
                  {shown === 'explore' && <ExploreScreen city={city} category={category} q={q} when={when} onFilter={setFilters} />}
                  {shown === 'budget' && <BudgetScreen />}
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {mapMounted && status === 'ready' && city && (
        // MapScreen es un chunk aparte (MapLibre): mientras llega, la misma zona fija muestra la carga, sin saltos.
        <Suspense fallback={<MapFallback active={mapActive} onExited={onMapExited} />}>
          <MapScreen city={city} focus={focus} active={mapActive} onExited={onMapExited} />
        </Suspense>
      )}

      <BottomNav current={tab} onNavigate={navigate} />
    </div>
  );
}
