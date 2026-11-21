# Visión de KinHop

KinHop (nombre de la app desde el 21/11/2026; el repositorio conserva el nombre técnico KindHop) es una **plataforma de decisiones urbanas** mobile-first para visitantes y residentes. No es simplemente un mapa con puntos: integra movilidad, exploración, incidencias, actividades y gastos del viaje, con explicaciones trazables de por qué se recomienda una opción.

**Usuario principal (MVP):** persona que explora Cancún y desea moverse con transporte local, descubrir puntos de interés, consultar eventos y conocer su presupuesto disponible. **Prueba de escalabilidad:** mismo frontend y lógica con configuración CDMX.

**Problema:** fuentes fragmentadas, recorridos no siempre claros, información urbana cambiante y gastos de viaje fuera de contexto.

**Propuesta de valor:** en un solo lugar: ¿a dónde ir?, ¿cómo llegar?, ¿qué condiciones conocer?, ¿qué eventos hay?, ¿cuánto llevo gastado? Una recomendación puede adaptarse al presupuesto y condiciones reportadas, siempre señalando qué información está confirmada o simulada.

**Diferenciador defendible:** plataforma multicidad basada en adaptadores + decisiones explicables y restricciones contextuales; no prometer exclusividad tecnológica o IA mágica.

**Ángulo del pitch (21/11/2026, [HACKATHON.md](../../HACKATHON.md)):** gasto local. Cuando el turista abre un lugar de cadena, KinHop le propone negocios locales cercanos y le explica por qué; la Billetera mide qué parte de su gasto se quedó en la ciudad. Une turismo y economía en una sola acción.

**Usuario cabeza de playa:** turista independiente (sin "todo incluido") que se mueve por el centro de Cancún con el teléfono: decide en el momento dónde comer o comprar.

**Modelo de negocio (decidido por el equipo el 21/11/2026, [monetization](../02-modules/monetization.md)):** cinco fuentes de ingresos: anuncios AdMob para usuarios gratis; organizadores que pagan por los 3 primeros puestos de eventos recomendados (cada puesto con su precio); negocios locales que pagan por prioridad en búsqueda, recomendación y mapa; anuncios personalizados propios en app y web; y suscripción **KinHop Pro** con Stripe (sin anuncios un mes y cupones en negocios con convenio). Todo lo pagado lleva etiqueta y va aparte de las recomendaciones explicadas.

**Líneas del hackatón:** turismo y economía, con medio ambiente e inclusión transversales. Métricas potenciales: rutas consultadas, reportes confirmados, eventos abiertos y planes dentro de presupuesto. Evitar afirmaciones de impacto sin estudio.
