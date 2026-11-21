# ADR-0002 — Reglas de Larpatron y herramientas de verificación

**Fecha:** 2026-11-20 · **Estado:** Aceptado (el punto 2 lo sustituye [ADR-0005](0005-tarjeta-de-visita-y-motion.md))

**Contexto:** el equipo preparó Larpatron (React sin Tailwind, sin backend) como base para el hackatón. KindHop tiene stack fijo distinto (Tailwind, Express+TS, PostgreSQL) y debe empezar con historial nuevo.

**Decisión:**
1. Adoptar las reglas de colaboración y arquitectura de Larpatron (features por `index.js`, hook/servicio/http, estados, a11y, revisor, checklist de demo), reescritas; no copiar código. Detalle en `docs/agent/LARPATRON.md`.
2. Sustituir su sistema de diseño monocromo por tokens Tailwind con un acento y colores de estado (un mapa necesita distinguir capas y procedencia).
3. Verificación sin dependencias extra: API con `node:test` vía `tsx --test`; lógica pura de la web con `node --test`; ESLint 9 en la web; `tsc` en la API. E2E con Playwright solo para el flujo de demo (KH-008).
4. Express 5 (errores síncronos y asíncronos llegan al manejador sin envoltorios), zod para validación, `process.loadEnvFile` en lugar de dotenv.

**Consecuencias:** menos dependencias y una sola forma de probar; si un caso necesita mocks de navegador se valorará Vitest con un ADR nuevo.
