// API pública del módulo decisions. Otros módulos importan solo desde aquí.
export { suggestionsRouter } from './routes.js';
export { suggest, type Suggestion, type SuggestInput, type Candidate, type Confidence, type DataStatus } from './suggest.js';
