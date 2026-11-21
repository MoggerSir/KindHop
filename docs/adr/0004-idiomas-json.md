# ADR-0004 — Todo el texto de la app en un JSON por idioma

**Fecha:** 2026-11-20 · **Estado:** Aceptado

## Contexto
El equipo quiere que todo el texto de la app esté organizado, que cambiar o añadir un idioma sea fácil y que los componentes no tengan texto suelto. Habrá muchos cambios de textos durante el hackatón. Pilotos con turistas: español e inglés desde el inicio.

## Decisión
1. **Un JSON por idioma** en `apps/web/src/shared/i18n/locales/` (`es.json`, `en.json`), con secciones por feature. Es la única fuente de texto visible de la web.
2. **Sin librería** (no i18next ni similar): un contexto React de ~60 líneas (`I18nProvider` + `useI18n().t`) cubre lo que hace falta: claves anidadas, `{variables}`, idioma recordado y cambio en caliente. `AGENTS.md` pide acuerdo para añadir librerías y no hay caso que lo justifique.
3. **Los dos JSON se importan siempre** (pesan pocos kB). Si crecen mucho o hay 4+ idiomas, cambiar a `import()` dinámico dentro de `i18n.js` sin tocar componentes.
4. **Errores por código:** la web traduce `error.code` (`errors.<CODE>`); el `message` de la API queda solo para depurar. Así la API no necesita saber el idioma.
5. **Se hace cumplir con herramientas**, no solo con la guía: regla ESLint contra texto fijo en JSX y `scripts/check-i18n.mjs` en `npm run check`.

Guía de uso y recetas: [`docs/03-design/i18n.md`](../03-design/i18n.md).

## Cómo cambiar esta decisión
- Pasar a una librería (p. ej. si se necesitan plurales complejos): los JSON y las llamadas `t('clave', vars)` son compatibles con i18next; basta con reimplementar `useI18n()` encima de ella.
- Textos servidos por la API (p. ej. contenido editorial traducido): ADR nuevo; no mezclar con los textos de interfaz.

## Consecuencias
- Cada texto nuevo cuesta tocar dos archivos; a cambio, nunca queda un idioma a medias (el check falla).
- Los JSON son archivos compartidos: cada feature edita solo su sección para evitar conflictos de merge.
