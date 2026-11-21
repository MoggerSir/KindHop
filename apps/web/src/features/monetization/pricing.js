// Precios propuestos del modelo de ingresos (KH-021), en centavos MXN. Única fuente: la UI y el pitch los leen de aquí.
// Son una propuesta del equipo para el hackatón, no tarifas publicadas. Cambiarlos aquí y en PITCH.md.
export const PRO_MONTHLY_CENTS = 5_900;

// Puesto pagado entre los 3 primeros eventos recomendados, por semana. El 1 vale más que el 3.
export const EVENT_SLOT_CENTS = { 1: 59_900, 2: 39_900, 3: 24_900 };

// Negocio local destacado: prioridad en búsqueda, recomendación y mapa, siempre con etiqueta "Patrocinado".
export const BUSINESS_BOOST_MONTHLY_CENTS = 29_900;

// Anuncio personalizado propio (banner en la app y en la web), desde.
export const CUSTOM_AD_MONTHLY_CENTS = 150_000;
