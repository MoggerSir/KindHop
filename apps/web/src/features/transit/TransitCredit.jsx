import { DataStatusBadge } from '@/shared/components/DataStatusBadge.jsx';
import { useI18n } from '@/shared/i18n';

function formatRetrieved(iso, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
}

// Crédito del snapshot GTFS. El nombre de la línea y la licencia salen de la API, no del JSON de idiomas.
export function TransitCredit({ source, routes }) {
  const { t, locale } = useI18n();
  return (
    <div className="pointer-events-auto rounded-card border border-line bg-surface/95 p-3 text-xs text-ink-2 shadow-raised">
      <div className="flex flex-wrap items-center gap-x-3">
        <DataStatusBadge status={source.dataStatus} />
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current"
          >
            {source.attribution || source.name}
          </a>
        ) : (
          <span className="text-ink">{source.attribution || source.name}</span>
        )}
        {source.licenseUrl ? (
          <a
            href={source.licenseUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center underline decoration-line-strong underline-offset-4 hover:decoration-current"
          >
            {source.license}
          </a>
        ) : (
          <span>{source.license}</span>
        )}
      </div>
      <p>{source.retrievedAt ? t('transit.retrieved', { date: formatRetrieved(source.retrievedAt, locale) }) : t('transit.noDate')}</p>
      <p>{t('transit.staticNotice')}</p>
      {routes.map((route) => (
        <p key={route.id} className="mt-1 flex items-center gap-2 text-ink">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: route.color || 'var(--color-accent)' }}
          />
          <span>
            {route.shortName ? `${route.shortName} · ${route.name}` : route.name}
            {' · '}
            {t('transit.stops', { count: route.stops.length })}
          </span>
        </p>
      ))}
    </div>
  );
}
