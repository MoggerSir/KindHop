# Alcance MVP y exclusiones

## P0 — indispensable para demo
- Mapa mobile-first, selector Cancún / CDMX, estilos y atribución correctos.
- Capas: recorridos de transporte disponibles, puntos de interés verificados y divisiones geográficas según datos realmente licenciados.
- Escenario Cancún con API de rutas preexistente **como servicio externo declarado**, nunca afirmar autoría de código nuevo. CDMX mediante fuente validada / subconjunto demostrable.
- Consulta de un lugar y propuesta de cómo llegar; si faltan datos, mostrar "no disponible", no fabricar rutas.

## P1 — después del primer flujo funcionando
- Tablón de eventos fechados y con fuente.
- Reporte de inundación con expiración, moderación y estado `UNVERIFIED`.
- Presupuesto/gastos manuales, categorías y gráfica (CSV opcional).
- Motor sencillo de reglas para alternativas explicables ante presupuesto o condiciones simuladas.

## P2 — solo si P0 y P1 están estables
- Autenticación más elaborada, analítica agregada, expansión a más ciudades, enriquecimiento inteligente, modo offline real, integración open finance formal.

## Fuera del MVP
- Extracción de movimientos de tarjetas por Google Wallet; almacenar tarjetas/CVV/PAN o contraseñas; datos de incidencias falsamente presentados como en vivo; algoritmos hidrológicos; garantía de caminos seguros; redes de transporte sin licencia/datos; apps nativas separadas.

**Demo mínimo aceptable:** cambiar ciudad (dos fuentes/configuraciones), navegar mapa, abrir POI y ruta, mostrar incidencia de demo con etiqueta y cambio de recomendación, registrar gasto y actualizar gráfico. Si hay menos tiempo, priorizar primer recorrido real y multicidad.
