// Eventos de EJEMPLO (dataStatus DEMO) hasta que exista GET /api/cities/:cityId/events (KH-014).
// Las fechas se generan relativas a hoy para que la demo nunca muestre eventos caducados.
// Textos en events.demo.<id>.* de shared/i18n/locales/*.json; fotos de Wikimedia Commons (créditos en docs/06-data/sources.md).
const CANCUN_UTC_OFFSET = '-05:00'; // Cancún no cambia de horario

const PHOTOS = {
  nightMarket: {
    src: '/demo/events/night-market.jpg',
    position: 'center 75%', // la escena está abajo; arriba solo hay cielo
    author: 'Samantha RV',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tianguis_de_la_Puri_por_la_noche.jpg',
  },
  concert: {
    src: '/demo/events/concert.jpg',
    author: 'Czardelarua',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Evento_Parque_Palapas_Cancun.JPG',
  },
  ceramics: {
    src: '/demo/events/ceramics.jpg',
    author: 'Tahirceylan',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pottery_Master.jpg',
  },
  food: {
    src: '/demo/events/food.jpg',
    author: 'City Foodsters',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Parque_de_las_Palapas_1.jpg',
  },
};

// [id, categoría, días desde hoy, hora inicio, hora fin]
const SCHEDULE = [
  // El destacado de hoy usa una foto de 960 px; night-market.jpg es de 480 px y solo cabe bien en tarjeta compacta.
  ['concert', 'music', 0, '20:00', '23:00'],
  ['nightMarket', 'food', 1, '18:00', '23:00'],
  ['ceramics', 'art', 2, '11:00', '13:00'],
  ['food', 'food', 4, '19:00', '22:00'],
];

export const DEMO_EVENTS_BY_CITY = { cancun: SCHEDULE };

function localDate(todayKey, plusDays) {
  return new Date(Date.parse(`${todayKey}T12:00:00Z`) + plusDays * 86_400_000).toISOString().slice(0, 10);
}

// Eventos con la forma del contrato (Event + category + image), textos ya traducidos con `t`.
export function buildDemoEvents(cityId, todayKey, t) {
  return (DEMO_EVENTS_BY_CITY[cityId] ?? []).map(([id, category, plusDays, from, to]) => {
    const date = localDate(todayKey, plusDays);
    return {
      id: `demo-${id}`,
      title: t(`events.demo.${id}.title`),
      venue: t(`events.demo.${id}.venue`),
      category,
      startsAt: new Date(`${date}T${from}:00${CANCUN_UTC_OFFSET}`).toISOString(),
      endsAt: new Date(`${date}T${to}:00${CANCUN_UTC_OFFSET}`).toISOString(),
      sourceUrl: null,
      dataStatus: 'DEMO',
      image: { ...PHOTOS[id], alt: t(`events.demo.${id}.imageAlt`) },
    };
  });
}
