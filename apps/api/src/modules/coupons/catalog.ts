// Cupones de la suscripción Pro (KH-021). DEMO: negocios y convenios simulados para el pitch; ningún comercio real
// ha firmado convenio. shortcut: catálogo en código, sin tabla; pasar a una tabla `coupons` cuando haya convenios reales.

export type CouponLang = 'es' | 'en';

type Text = Record<CouponLang, string>;

type CatalogCoupon = {
  id: string;
  cityId: string;
  code: string;
  business: string;
  category: 'food' | 'shopping' | 'activities';
  discount: Text;
  conditions: Text;
  validUntil: string;
  locations: { name: string; zone: Text; coordinates: [number, number] }[];
};

export type Coupon = Omit<CatalogCoupon, 'cityId' | 'discount' | 'conditions' | 'locations'> & {
  discount: string;
  conditions: string;
  locations: { name: string; zone: string; coordinates: [number, number] }[];
  dataStatus: 'DEMO';
};

const CATALOG: CatalogCoupon[] = [
  {
    id: 'cun-cafe',
    cityId: 'cancun',
    code: 'KH-CAFE15',
    business: 'Café Chakáa',
    category: 'food',
    discount: { es: '15 % en bebidas y pan dulce', en: '15% off drinks and sweet bread' },
    conditions: { es: 'Una vez al día por cuenta Pro.', en: 'Once a day per Pro account.' },
    validUntil: '2026-12-31',
    locations: [
      { name: 'Café Chakáa · Centro', zone: { es: 'Centro, junto al Parque de las Palapas', en: 'Downtown, next to Parque de las Palapas' }, coordinates: [-86.8262, 21.1612] },
      { name: 'Café Chakáa · Mercado 28', zone: { es: 'Zona Mercado 28', en: 'Mercado 28 area' }, coordinates: [-86.8325, 21.1625] },
    ],
  },
  {
    id: 'cun-tacos',
    cityId: 'cancun',
    code: 'KH-TACO2X1',
    business: 'Taquería Doña Xoco',
    category: 'food',
    discount: { es: '2×1 en tacos al pastor los martes', en: '2-for-1 al pastor tacos on Tuesdays' },
    conditions: { es: 'Solo martes, en el local.', en: 'Tuesdays only, dine-in.' },
    validUntil: '2026-12-31',
    locations: [{ name: 'Taquería Doña Xoco', zone: { es: 'Av. Tulum, Centro', en: 'Av. Tulum, Downtown' }, coordinates: [-86.8245, 21.1588] }],
  },
  {
    id: 'cun-artesanias',
    cityId: 'cancun',
    code: 'KH-ARTE10',
    business: 'Taller Kaab Artesanías',
    category: 'shopping',
    discount: { es: '10 % en artesanía hecha en Quintana Roo', en: '10% off crafts made in Quintana Roo' },
    conditions: { es: 'Compras desde $300 MXN.', en: 'Purchases from MX$300.' },
    validUntil: '2026-12-31',
    locations: [{ name: 'Taller Kaab Artesanías', zone: { es: 'Zona Mercado 28', en: 'Mercado 28 area' }, coordinates: [-86.8331, 21.1631] }],
  },
  {
    id: 'cun-kayak',
    cityId: 'cancun',
    code: 'KH-KAYAK100',
    business: 'Kayak Nichupté',
    category: 'activities',
    discount: { es: '$100 MXN menos en el recorrido por la laguna', en: 'MX$100 off the lagoon tour' },
    conditions: { es: 'Reserva con un día de anticipación.', en: 'Book one day ahead.' },
    validUntil: '2026-12-31',
    locations: [{ name: 'Kayak Nichupté · Muelle', zone: { es: 'Laguna Nichupté, Zona Hotelera km 6', en: 'Nichupté Lagoon, Hotel Zone km 6' }, coordinates: [-86.7905, 21.1395] }],
  },
  {
    id: 'cdmx-cafe',
    cityId: 'cdmx',
    code: 'KH-COYO15',
    business: 'Café Tlalli',
    category: 'food',
    discount: { es: '15 % en café de especialidad', en: '15% off specialty coffee' },
    conditions: { es: 'Una vez al día por cuenta Pro.', en: 'Once a day per Pro account.' },
    validUntil: '2026-12-31',
    locations: [{ name: 'Café Tlalli · Coyoacán', zone: { es: 'Centro de Coyoacán', en: 'Coyoacán center' }, coordinates: [-99.1625, 19.3497] }],
  },
  {
    id: 'cdmx-libros',
    cityId: 'cdmx',
    code: 'KH-LIBRO10',
    business: 'Librería El Zaguán',
    category: 'shopping',
    discount: { es: '10 % en libros de autores mexicanos', en: '10% off books by Mexican authors' },
    conditions: { es: 'No acumulable con otras promociones.', en: 'Not combinable with other offers.' },
    validUntil: '2026-12-31',
    locations: [{ name: 'Librería El Zaguán', zone: { es: 'Centro Histórico', en: 'Historic Center' }, coordinates: [-99.1366, 19.4335] }],
  },
];

export function couponsFor(cityId: string, lang: CouponLang): Coupon[] {
  return CATALOG.filter((c) => c.cityId === cityId).map(({ cityId: _city, discount, conditions, locations, ...rest }) => ({
    ...rest,
    discount: discount[lang],
    conditions: conditions[lang],
    locations: locations.map((l) => ({ name: l.name, zone: l.zone[lang], coordinates: l.coordinates })),
    dataStatus: 'DEMO' as const,
  }));
}
