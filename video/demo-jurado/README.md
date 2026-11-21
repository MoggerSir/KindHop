# Video de demo para el jurado (HyperFrames)

300 s · 1920×1080 · 30 fps · MP4 H.264. Composición HTML + GSAP hecha con [HyperFrames](https://hyperframes.heygen.com), iniciada por Claude Code y terminada/revisada en Codex.

- `index.html`: composición editable y línea de tiempo de 5:00.
- `storyboard.json`: diez capítulos con tiempos, discurso y conteo de palabras.
- `../../docs/05-delivery/kinhop-speech-5min.md`: discurso limpio para aprender.
- `../../PITCH.md`: guion de 635 palabras para un presentador, escaleta, ensayo y preguntas del jurado.
- `assets/*.png`: 16 capturas reales de la app, cuenta DEMO, 21/11/2026. Incluyen las funciones de KH-020/KH-021 mostradas en los PR #34/#35; el video no integra esos PRs.
- `SPEC.md`: recorrido, decisiones visuales y límites de las afirmaciones.
- `REVIEW.md`: comprobaciones y limitaciones de la entrega.
- Salida: `docs/05-delivery/kinhop-demo-jurado.mp4`.

```bash
cd video/demo-jurado
npm run dev       # editor/vista previa de HyperFrames
npm run check     # valida composición, recursos, layout y contraste
npm run render    # necesita FFmpeg en PATH; la primera ejecución prepara Chrome
```

Los scripts usan una caché privada en `~/.local/share/hyperframes-cache`; se puede sustituir con `HYPERFRAMES_CACHE_DIR`. Si ya tienes un Chrome instalado, `HYPERFRAMES_BROWSER_PATH` permite elegir su ejecutable. La composición descarga GSAP y las fuentes desde sus proveedores al prepararse; el MP4 terminado se reproduce sin red.

Video sin narración ni música, sincronizado con el pitch oral de cinco minutos. No se hizo un anuncio de cinco minutos: se sostienen pantallas y esquemas mientras el presentador desarrolla cada pregunta. Los rótulos mantienen visibles el estado DEMO y las integraciones de cobro/anuncios pendientes. No se han añadido datos personales reales a las capturas.

Para editar: actualiza coordinadamente `storyboard.json`, `PITCH.md` y los textos en `index.html`; los inicios y duraciones están en `data-start`/`data-duration` y en los tiempos de GSAP. Si cambia la app, vuelve a capturar las pantallas conservando los nombres. Fuentes y licencias de las imágenes mostradas por la app: `docs/06-data/sources.md`.
