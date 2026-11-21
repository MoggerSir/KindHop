// GeoJSON simulado (DEMO) de rutas de transporte en Cancún.
// Se usa por reglas del hackatón (sin consumir APIs externas preexistentes del autor).
// Todas las rutas y paradas son aproximaciones simuladas y se devuelven siempre con `dataStatus: 'DEMO'`.

export const CANCUN_DEMO_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        id: 'SIM-R1',
        name: 'Ruta R-1 Simulada · Centro ↔ Zona Hotelera',
        mode: 'bus' as const,
        color: '#ccff00',
        fareCents: 1200,
        stops: [
          { id: 'sim-r1-1', name: 'Parque de las Palapas (simulada)', coordinates: [-86.8265, 21.1617] as [number, number] },
          { id: 'sim-r1-2', name: 'Av. Tulum / Cobá (simulada)', coordinates: [-86.822, 21.1535] as [number, number] },
          { id: 'sim-r1-3', name: 'Entrada Zona Hotelera (simulada)', coordinates: [-86.805, 21.147] as [number, number] },
          { id: 'sim-r1-4', name: 'Punta Cancún (simulada)', coordinates: [-86.7475, 21.1325] as [number, number] },
          { id: 'sim-r1-5', name: 'Playa Delfines (simulada)', coordinates: [-86.7804, 21.0596] as [number, number] },
        ],
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [-86.8265, 21.1617],
          [-86.824, 21.1575],
          [-86.822, 21.1535],
          [-86.814, 21.15],
          [-86.805, 21.147],
          [-86.786, 21.1435],
          [-86.765, 21.14],
          [-86.7475, 21.1325],
          [-86.758, 21.112],
          [-86.769, 21.089],
          [-86.7804, 21.0596],
        ] as [number, number][],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'SIM-R2',
        name: 'Ruta R-2 Simulada · Crucero ↔ Mercado 28 ↔ Cobá',
        mode: 'bus' as const,
        color: '#3987e5',
        fareCents: 1000,
        stops: [
          { id: 'sim-r2-1', name: 'El Crucero (simulada)', coordinates: [-86.826, 21.1745] as [number, number] },
          { id: 'sim-r2-2', name: 'Mercado 28 (simulada)', coordinates: [-86.8318, 21.1636] as [number, number] },
          { id: 'sim-r2-3', name: 'Casa de la Cultura (simulada)', coordinates: [-86.8494, 21.1527] as [number, number] },
          { id: 'sim-r2-4', name: 'Av. Kabah Sur (simulada)', coordinates: [-86.845, 21.138] as [number, number] },
        ],
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [-86.826, 21.1745],
          [-86.8295, 21.169],
          [-86.8318, 21.1636],
          [-86.84, 21.158],
          [-86.8494, 21.1527],
          [-86.8475, 21.145],
          [-86.845, 21.138],
        ] as [number, number][],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'SIM-R15',
        name: 'Ruta R-15 Simulada · Puerto Juárez ↔ Centro',
        mode: 'bus' as const,
        color: '#199e70',
        fareCents: 1000,
        stops: [
          { id: 'sim-r15-1', name: 'Puerto Juárez (simulada)', coordinates: [-86.8085, 21.1865] as [number, number] },
          { id: 'sim-r15-2', name: 'Av. López Portillo (simulada)', coordinates: [-86.819, 21.177] as [number, number] },
          { id: 'sim-r15-3', name: 'Mercado 23 (simulada)', coordinates: [-86.8268, 21.168] as [number, number] },
          { id: 'sim-r15-4', name: 'Av. Nichupté (simulada)', coordinates: [-86.8365, 21.1455] as [number, number] },
        ],
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [-86.8085, 21.1865],
          [-86.814, 21.1815],
          [-86.819, 21.177],
          [-86.8268, 21.168],
          [-86.831, 21.1565],
          [-86.8365, 21.1455],
        ] as [number, number][],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'SIM-R27',
        name: 'Ruta R-27 Simulada · Museo Maya ↔ Av. Bonampak',
        mode: 'bus' as const,
        color: '#d95926',
        fareCents: 1200,
        stops: [
          { id: 'sim-r27-1', name: 'Museo Maya (simulada)', coordinates: [-86.7739, 21.0798] as [number, number] },
          { id: 'sim-r27-2', name: 'Blvd. Kukulcán Norte (simulada)', coordinates: [-86.798, 21.139] as [number, number] },
          { id: 'sim-r27-3', name: 'Av. Bonampak (simulada)', coordinates: [-86.818, 21.156] as [number, number] },
        ],
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [-86.7739, 21.0798],
          [-86.772, 21.102],
          [-86.783, 21.126],
          [-86.798, 21.139],
          [-86.811, 21.149],
          [-86.818, 21.156],
        ] as [number, number][],
      },
    },
  ],
};
