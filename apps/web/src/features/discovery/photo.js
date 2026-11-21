// Una foto sin estado o con estado DEMO es genérica (ADR-0008); solo `REAL` es una foto de ese lugar con fuente.
export const isIllustrative = (poi) => Boolean(poi.imageUrl) && poi.imageDataStatus !== 'REAL';
