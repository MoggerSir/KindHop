# Video de demo para el jurado (HyperFrames)

96 s · 1920×1080 · 30 fps · MP4 H.264. Composición HTML + GSAP hecha con [HyperFrames](https://hyperframes.heygen.com), iniciada por Claude Code y terminada/revisada en Codex.

- `index.html`: composición editable y línea de tiempo.
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

Video sin narración ni música, pensado para acompañar el pitch oral. Los rótulos mantienen visibles el estado DEMO y las integraciones de cobro/anuncios pendientes. No se han añadido datos personales reales a las capturas.

Para editar: cambia los textos en `index.html`; los inicios y duraciones están en `data-start`/`data-duration` y en los tiempos de GSAP. Si cambia la app, vuelve a capturar las pantallas conservando los nombres. Fuentes y licencias de las imágenes mostradas por la app: `docs/06-data/sources.md`.
