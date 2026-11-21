# Revisión del pitch orientada al jurado

Aplicadas `pitch-timebox` y `judge-sim`. El cálculo automático que sigue usa los estados previos de la app y es una heurística local; no valida el negocio ni predice la puntuación real. No se enviaron datos a servicios externos. La rúbrica oficial no está confirmada.

## Objeciones resueltas en esta revisión

| Dimensión | Riesgo para entender el proyecto | Cambio concreto |
|---|---|---|
| Claridad del problema | Presentar una lista de funciones sin destinatario | Gancho del turista que elige lo conocido; turista de destino como primer usuario |
| Originalidad | Parecer otro mapa genérico | Cadena → alternativa explicada → registro personal; no se inventan carencias de competidores |
| Completitud | Confundir datos abiertos con simulaciones | Capturas reales; REAL/DEMO explícitos y cobros/anuncios pendientes |
| Profundidad técnica | Enumerar tecnologías sin mostrar cómo se conectan | Diagrama web → API modular → PostgreSQL y flujo de adaptadores por ciudad |
| Calidad de demo | Video de 96 s no acompaña un pitch de 5 min | Video de 300 s, diez capítulos, 635 palabras, anclas y reloj |
| Valor de negocio | Precios sin motivo para pagar | Beneficio para comercio y Pro; precio como hipótesis; piloto para validar demanda |
| Preparación | Presentador sin guion ni respuestas | Speech literal, tabla de tiempos, Q&A y dos ensayos indicados; ensayo humano pendiente |

**FIX_NOW aplicados:** duración, voz única, significado del nombre, arquitectura, expansión y motivos para usar/pagar; límites de las afirmaciones económicas.

**FIX_LAST_10MIN:** ensayar en el equipo del evento, comprobar tamaño de proyección, descargar MP4 y retomar por anclas si hay un olvido.

**DO_NOT_TOUCH para esta entrega:** autenticación, API, cobros, anuncios y otras funciones de la app. El trabajo modifica material de presentación, no finge integraciones.

## Salida automática orientativa

# Judge Simulation

_Generated: 2026-11-21T10:41:38.199416+00:00_

**Overall score: 3.29 / 5**

## problem_clarity - 4/5

- **Deduction**: Default score; reviewer should adjust.
- **Likely questions**:
  - Who is the target user?
  - What problem does this solve and for whom?
- **Improvements**:

## originality - 3/5

- **Deduction**: Cannot score without code review; default 3.
- **Likely questions**:
  - What is novel compared to existing solutions?
  - What does this do that existing tools cannot?
- **Improvements**:
  - Add a single sentence: 'Unlike X, we Y.'

## completeness - 4/5

- **Deduction**: Demo path runs; minor gaps remain.
- **Likely questions**:
  - Does the demo actually run end-to-end?
  - Did you run the demo from a clean clone?
- **Improvements**:

## technical_depth - 3/5

- **Deduction**: Heuristic default; reviewer should adjust.
- **Likely questions**:
  - What was the hardest engineering decision?
  - What tradeoff did you accept to ship in time?
- **Improvements**:
  - Be ready to explain one non-obvious technical choice in 60 seconds.

## demo_quality - 4/5

- **Deduction**: demo.json present; rehearse before submission.
- **Likely questions**:
  - Can you summarize what you built in 30 seconds?
  - What is the single best moment in the demo?
- **Improvements**:
  - Time the demo with a stopwatch; aim for <= stated budget.

## business_value - 3/5

- **Deduction**: Cannot score without user interviews; default 3.
- **Likely questions**:
  - Who would pay for this and why?
  - What is the beachhead user segment?
- **Improvements**:
  - Add one sentence: 'Our beachhead user is X.'

## submission_readiness - 2/5

- **Deduction**: Heuristic; run ship-pack to verify.
- **Likely questions**:
  - Can a stranger clone and run your project in 5 minutes?
  - What secrets or keys must not be committed?
- **Improvements**:
  - Run ship-pack before submission.

## Fix priorities

### FIX NOW (<30 min, raises score)
- [submission_readiness] Run ship-pack before submission.

### FIX IN LAST 10 MIN (cosmetic only)
- [originality] Add a single sentence: 'Unlike X, we Y.'
- [technical_depth] Be ready to explain one non-obvious technical choice in 60 seconds.
- [business_value] Add one sentence: 'Our beachhead user is X.'

### DO NOT TOUCH (risks the demo)
- [demo_quality] Time the demo with a stopwatch; aim for <= stated budget.
