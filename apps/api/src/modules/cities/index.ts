// API pública del módulo cities. Otros módulos importan solo desde aquí, nunca sus archivos internos.
export { citiesRouter } from './routes.js';
export { cities, findCity, type City, type ModuleStatus } from './catalog.js';
export { requireCity } from './require-city.js';
