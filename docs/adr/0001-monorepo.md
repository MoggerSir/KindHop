# ADR-0001 — Monorepo ligero

**Fecha:** 2026-11-20 · **Estado:** Aceptado (bootstrap)

**Contexto:** un equipo pequeño debe entregar app mobile-first con datos de dos ciudades y API funcional en un hackatón.

**Decisión:** npm workspaces (`apps/web`, `apps/api`) y SQL versionado (`db/migrations`); React/JSX en frontend, Express/TypeScript en backend, PostgreSQL. Módulos por capacidad. No microservicios ni construcción de monorepo con orquestadores pesados.

**Consecuencia:** instalación y flujo simples, separación clara, riesgo bajo de sobreingeniería. Tradeoff: menos automatización compleja, suficiente para una demo.
