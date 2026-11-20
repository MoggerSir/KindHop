# Checklist de calidad y demo

## Por cada slice (DoD)
- [ ] `npm run check` y `npm run build` en verde; resultado pegado en la tarjeta.
- [ ] Flujo probado en navegador a 390px y escritorio, con teclado.
- [ ] Estados carga / error / vacío vistos.
- [ ] Datos con `dataStatus`, fuente y fecha; nada "en vivo" que no lo sea.
- [ ] README / FILEMAP / contrato / doc del módulo al día.

## T-60 min: estabilidad
- [ ] `main` en verde en CI; `npm run build` + `npm run preview -w @kinhop/web` funciona (no solo `dev`).
- [ ] Guion de `demo.md` completo 3 veces seguidas.
- [ ] Datos de demo realistas (nada de "test", "asdf"); los simulados con `DEMO` visible.
- [ ] Plan B sin red: qué se ve si cae el mapa base o la API de Rutas Cancún.
- [ ] Consola del navegador limpia.

## T-30 min: pulido
- [ ] 1280×720 y 1920×1080 en proyector y un móvil real.
- [ ] Favicon y `<title>` correctos; textos sin faltas; sin emojis.
- [ ] Atribución del mapa visible.
- [ ] `judge-sim` corrido y sus arreglos de prioridad alta hechos (si la skill está disponible).

## T-15 min: entorno
- [ ] Pantalla completa, zoom 100%, notificaciones desactivadas, cargador conectado.
- [ ] Pestañas: app desplegada, local y video de respaldo.
- [ ] La demo empieza por el problema, no por la configuración.
