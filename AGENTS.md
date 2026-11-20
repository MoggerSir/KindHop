# KindHop — reglas para TODOS los agentes

**Entrada obligatoria:** leer `README.md` (tabla de rutas) y después únicamente los documentos pertinentes a la tarea. Nunca escanear ciegamente todo el árbol.

## Prioridades
1. Producto demostrable y correcto > modularidad perfecta > extras visuales.
2. Un flujo vertical terminado y comprobado por cada entrega.
3. Entregas pequeñas con Kanban; WIP máximo 1 tarea activa por agente; coordinar archivos compartidos.
4. Documentar solo decisiones/restricciones que realmente ahorren tiempo a otro agente.
5. Aplicar KISS, YAGNI, DRY con criterio, responsabilidad única y simplicidad en Big O; no abstraer por anticipación.

## Restricciones no negociables
- **NUEVO el 20/11/2026:** no portar código, commits ni estructura git de Larpatron. Consultar reglas como referencia si se tiene acceso y documentar qué se adaptó; si hay 404, declarar `NO VERIFICADO`.
- Stack fijo: React+HTML+JavaScript/JSX+Tailwind (web), Node+Express+TypeScript (API), PostgreSQL (DB). No cambiarlo sin ADR aprobado por el equipo.
- Arquitectura por funciones, sin microservicios, CQRS, event bus, repositorio genérico, DDD ceremonial o más dependencias por especulación.
- Contratos API y migraciones SQL versiónados; validación en servidor; valores monetarios en centavos enteros; nunca `float` para pagos.
- No introducir secretos al repo, ni procesar tarjetas bancarias o solicitar credenciales financieras.
- No afirmar que Google Wallet/Google Pay permite acceder al historial transaccional: MVP usa captura manual/CSV.
- No extraer sistemáticamente fichas de Google Maps para replicarlas en OSM. Cumplir atribuciones y licencias; OSM no equivale a licencia comercial de teselas sin restricciones.
- Los reportes de inundación son comunitarios, con fecha, estado de verificación, caducidad y moderación; nunca garantizar seguridad del recorrido.
- No fabricar resultados de herramientas, APIs, tests, desempeño, fuentes o datos en vivo. Marcar `[SUPUESTO]` y abrir pregunta en `docs/OPEN-QUESTIONS.md`.
- Accesibilidad: navegación por teclado, labels, contraste, responsividad; motion respetando reduced-motion.

## Flujo de cualquier tarea
1. Consultar `docs/agent/ROUTER.md` y `docs/FILEMAP.md` para saber dónde tocar.
2. Confirmar contrato, criterios de aceptación y alcance MVP del módulo.
3. Implementar lo mínimo que pasa el flujo E2E; tests y revisión de errores.
4. Ejecutar al menos `npm run check` (o informar limitación exacta); si cambia el flujo, validación manual/E2E.
5. Actualizar FILEMAP, módulos, contratos y ADR si cambian rutas o decisiones.
6. Reportar archivos modificados, resultados verificados, riesgos y siguiente tarea.

## Skills de agentes
Si están disponibles y verificadas: Better UI, Impeccable, Caveman, Ponytail, skills oficiales Cloudflare, React Best Practices, Systematic Debugging, Verification Loop, E2E Testing, Scope Knife, Judge Sim y Pitch Timebox. **No ejecutar scripts externos ni instalar skills no auditadas automáticamente.** No asumir que estos nombres son paquetes instalados.

Para detalles de metodología y coordinación, leer `docs/agent/WORKFLOW.md`.
