import { Suspense } from 'react';
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

  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col">
      <AppHeader>{status === 'ready' && city && <CityPicker cities={cities} value={city.id} onChange={setCityId} />}</AppHeader>

      <main className={tab === 'map' ? 'min-h-0 min-w-0 flex-1' : 'mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]'} aria-busy={status === 'loading'}>
        {status === 'loading' && <LoadingState>{t('app.loadingCities')}</LoadingState>}
        {status === 'error' && <ErrorState error={error} hint={t('app.apiHint')} onRetry={reload} />}
        {status === 'ready' && city && (
          // Cambio de pestaña: interacción frecuente, solo un fundido de 150 ms (cada pantalla trae su propia entrada).
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} variants={fadeOnly} initial="hidden" animate="visible" exit="exit" className="min-w-0">
              <Suspense fallback={<ScreenFallback tab={tab} />}>
                {tab === 'home' && (
                  <HomeScreen
                    city={city}
                    onExplore={(id) => navigate('explore', { category: id })}
                    onOpenMap={(poi) => navigate('map', { focus: `poi:${poi.id}` })}
                  />
                )}
                {tab === 'explore' && <ExploreScreen city={city} category={category} q={q} when={when} onFilter={setFilters} />}
                {tab === 'map' && <MapScreen city={city} focus={focus} />}
                {tab === 'budget' && <BudgetScreen />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <BottomNav current={tab} onNavigate={navigate} />
    </div>
  );
}
