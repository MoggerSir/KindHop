// Reglas deterministas del motor (KH-013). La confianza sale de la regla, no de un puntaje inventado:
// - Incidencia cercana: MEDIUM. La distancia es haversine sobre lat/lon, no un recorrido medido.
// - Presupuesto bajo e is_free = true: HIGH. El booleano está en la fila.
// - Presupuesto bajo e is_free false o NULL: LOW. NULL no es gratis.
// - Sin fila en data_sources: LOW. Falta la procedencia.
// Si aplican varias, se queda la más baja.

export const REPORT_RADIUS_M = 300;
export const SEARCH_RADIUS_M = 40_000;
export const EARTH_RADIUS_M = 6_371_000;
export const SUGGESTION_LIMIT = 8;
export const MISSING_SOURCE = 'Sin fuente registrada';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type DataStatus = 'REAL' | 'DEMO' | 'USER_REPORTED' | 'UNVERIFIED';
export type SuggestLang = 'es' | 'en';

export type Candidate = {
  id: string;
  name: string;
  distanceM: number;
  isFree: boolean | null;
  sourceName: string;
  asOf: string;
  dataStatus: DataStatus;
};

export type SuggestInput = {
  originName: string;
  activeReportNearby: boolean;
  lowBudget: boolean;
  lang: SuggestLang;
  candidates: readonly Candidate[];
};

export type Suggestion = {
  title: string;
  placeId: string;
  why: string;
  source: string;
  asOf: string;
  confidence: Confidence;
  dataStatus: DataStatus;
};

const RANK: Record<Confidence, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };

export function suggest(input: SuggestInput): Suggestion[] {
  if (!input.activeReportNearby && !input.lowBudget) return [];
  return [...input.candidates]
    .sort((a, b) => compareCandidates(a, b, input.lowBudget))
    .map((candidate) => ({
      title: candidate.name,
      placeId: candidate.id,
      why: whyFor(candidate, input),
      source: candidate.sourceName,
      asOf: candidate.asOf,
      confidence: confidenceFor(candidate, input),
      dataStatus: candidate.dataStatus,
    }));
}

// true primero solo con presupuesto bajo. false y NULL comparten el segundo grupo: NULL no se adelanta por ser "gratis".
export function compareCandidates(a: Candidate, b: Candidate, lowBudget: boolean): number {
  if (lowBudget) {
    const byFree = freeRank(a) - freeRank(b);
    if (byFree !== 0) return byFree;
  }
  if (a.distanceM !== b.distanceM) return a.distanceM - b.distanceM;
  return compareId(a.id, b.id);
}

function freeRank(candidate: Candidate): number {
  return candidate.isFree === true ? 0 : 1;
}

function compareId(a: string, b: string): number {
  const ai = BigInt(a);
  const bi = BigInt(b);
  if (ai < bi) return -1;
  if (ai > bi) return 1;
  return 0;
}

function confidenceFor(candidate: Candidate, input: SuggestInput): Confidence {
  const ranks: number[] = [];
  if (input.activeReportNearby) ranks.push(RANK.MEDIUM);
  if (input.lowBudget) ranks.push(candidate.isFree === true ? RANK.HIGH : RANK.LOW);
  if (candidate.sourceName === MISSING_SOURCE) ranks.push(RANK.LOW);
  const rank = Math.min(...ranks);
  if (rank >= RANK.HIGH) return 'HIGH';
  if (rank >= RANK.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function whyFor(candidate: Candidate, input: SuggestInput): string {
  const t = copy[input.lang];
  const parts: string[] = [];
  if (input.activeReportNearby) {
    parts.push(t.activeReport(input.originName));
  }
  if (input.lowBudget) {
    parts.push(t.lowBudget);
    parts.push(t.priceSentence(candidate.isFree));
  }
  const meters = Math.round(candidate.distanceM);
  parts.push(t.alternative(meters));
  return parts.join(' ');
}

const copy = {
  es: {
    lowBudget: 'Presupuesto bajo.',
    activeReport: (name: string) => `Hay una incidencia activa a menos de ${REPORT_RADIUS_M} m de ${name}.`,
    alternative: (meters: number) =>
      `Alternativa de la misma categoría a ${meters} m, sin incidencias activas a menos de ${REPORT_RADIUS_M} m.`,
    priceSentence(isFree: boolean | null): string {
      if (isFree === true) return 'La fuente indica que es gratis.';
      if (isFree === false) return 'La fuente indica que no es gratis.';
      return 'La fuente no dice si es gratis; no se asume que lo sea.';
    },
  },
  en: {
    lowBudget: 'Low budget.',
    activeReport: (name: string) => `There is an active incident within ${REPORT_RADIUS_M} m of ${name}.`,
    alternative: (meters: number) =>
      `Same-category alternative ${meters} m away, with no active incidents within ${REPORT_RADIUS_M} m.`,
    priceSentence(isFree: boolean | null): string {
      if (isFree === true) return 'The source indicates it is free.';
      if (isFree === false) return 'The source indicates it is not free.';
      return 'The source does not say if it is free; it is not assumed to be.';
    },
  },
} as const;

const METERS_PER_DEG_LAT = (2 * Math.PI * EARTH_RADIUS_M) / 360;

// Caja del círculo de búsqueda. El SQL filtra después con la distancia, así la esquina de la caja no cuela.
export function searchBox(lat: number, lon: number): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const dLat = SEARCH_RADIUS_M / METERS_PER_DEG_LAT;
  const dLon = dLat / Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  return { minLat: lat - dLat, maxLat: lat + dLat, minLon: lon - dLon, maxLon: lon + dLon };
}
