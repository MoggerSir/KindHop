# Flujo de Git y GitHub — obligatorio para personas y agentes

Repositorio: <https://github.com/MoggerSir/KindHop> (privado).

## Regla corta (léela aunque no leas nada más)

1. **Todo cambio entra por PR hacia `developers`.** Nunca hagas `push` a `developers` ni a `main`.
2. **Un agente de IA nunca integra (merge) un PR**, ni el suyo ni el de otro, y nunca hace push a una rama compartida, salvo instrucción explícita del dueño del repo en esa misma sesión.
3. Trabaja en tu propia rama creada desde `developers`, con `npm run check` y `npm run build` en verde antes de abrir el PR.
4. Si no puedes abrir el PR (sin permisos, sin red), deja el trabajo en tu rama y dilo; no busques otra vía.

## Ramas

| Rama | Propósito |
|---|---|
| `main` | Estable, lo que se demuestra a los jueces. Solo recibe PR de liberación desde `developers`. |
| `developers` | Integración del trabajo del equipo. **Rama por defecto** del repositorio. |
| De trabajo | Una por tarjeta del [backlog](../05-delivery/backlog.md), creada desde `developers`. Se borra al integrar. |

Nombre de rama de trabajo: `<tipo>/KH-0xx-<descripcion-corta>`, minúsculas, sin tildes ni espacios.
Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `release`.

```
feat/KH-003-transporte-cancun
fix/KH-005-ficha-poi-foco
docs/KH-017-guion-demo
```

La tarjeta existe en el backlog **antes** de crear la rama. Renombrar la rama de un PR abierto lo cierra en GitHub: elige bien el nombre al principio.

## Flujo de una tarjeta

1. `git switch developers && git pull && git switch -c feat/KH-0xx-descripcion`
2. Commits pequeños en tu rama, en español y con prefijo: `feat(events): …`, `fix(map): …`, `docs: …`.
3. `npm run check` y `npm run build` en verde; prueba en navegador a 390 px y escritorio si cambia algo visible.
4. `git push -u origin <tu-rama>` y abre el PR **hacia `developers`** con la plantilla (`.github/pull_request_template.md`) completa, incluida la sección "No verificado".
5. Otra persona del equipo revisa; se resuelven todas las conversaciones.
6. Con la CI en verde y la aprobación, **una persona** integra con **squash merge**.

## Liberación a `main`

Cuando `developers` tiene un conjunto revisado y probado (p. ej. antes de cada demo):

1. PR `developers` → `main` titulado `Liberación AAAA-MM-DD`.
2. Descripción: tarjetas incluidas, resultado de la prueba manual del guion de demo y lo no verificado.
3. Aprobación de otra persona; se integra con **merge commit** (no squash) para conservar la correspondencia con `developers`.

## Commits

- Español, presente, con tipo y ámbito: `feat(transit): ruta R-1 de Cancún en el mapa`.
- Autor: la persona dueña del trabajo. En repos de MoggerSir, los agentes commitean como `MoggerSir <191432472+MoggerSir@users.noreply.github.com>` sin trailer de coautoría.
- Nunca `--force` sobre ramas compartidas. En tu propia rama, solo `--force-with-lease`.

## Excepción de arranque

El 2026-11-20 se creó `developers` con **un commit directo** (arquitectura modular, idiomas ES/EN, pantalla de inicio y estas reglas), por instrucción explícita del dueño del repositorio. Es la única excepción: desde ese momento todo cambio entra por PR.

## Estado de las protecciones de GitHub

Las reglas de esta página se cumplen **por acuerdo**: en un repositorio privado de una cuenta gratuita, GitHub no permite proteger ramas (la API responde `403 Upgrade to GitHub Pro or make this repository public`). Mismo caso y misma decisión que en el proyecto Galería de imágenes.

| Configuración | Estado |
|---|---|
| `developers` como rama por defecto | Activo |
| Borrar la rama de trabajo al integrar | Activo |
| CI en PR hacia `developers` y `main` (`.github/workflows/ci.yml`) | Activo |
| Bloquear push directo / exigir revisión / exigir CI verde | **No activo** (plan gratuito); se cumple por acuerdo |

Si la cuenta pasa a Pro/Education o el repo se hace público: activar la protección de `main` y `developers` (sin push directo, 1 aprobación, check de CI obligatorio, conversaciones resueltas).
