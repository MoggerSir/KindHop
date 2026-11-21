# KinHop — discurso y apoyo visual de cinco minutos

**Un presentador. Video de 5:00 exactos, sin narración ni música. Guion de 635 palabras.** Reproducir desde 0:00 y empezar a hablar al mismo tiempo. El video acompaña al expositor; no sustituye su voz. El ritmo exacto depende del ensayo: reservar pausas para señalar las pantallas, respirar y mirar al jurado.

La historia vende un cambio concreto: del turista que elige lo conocido al turista que descubre una alternativa cercana; del negocio invisible a una propuesta de visibilidad. Se explica qué existe y qué debe validarse. No hay rúbrica oficial confirmada: la cobertura se organiza por preguntas del jurado, sin inventar puntuaciones.

## Escaleta sincronizada

| Tiempo | Voz | Pregunta que resuelve / visual | Palabras | Ancla de memoria |
|---|---|---|---:|---|
| 0:00–0:25 | Presentador único | Una decisión que conecta | 49 | Kinship → conexión · Hop → salto |
| 0:25–0:45 | Presentador único | Qué es y por qué usarla | 42 | Descubrir · decidir · registrar |
| 0:45–1:25 | Presentador único | La diferencia, en una decisión | 85 | Cadena → alternativas → explicación |
| 1:25–1:50 | Presentador único | Del descubrimiento al gasto | 52 | Registro manual · sin conectar el banco |
| 1:50–2:15 | Presentador único | La ciudad en contexto | 52 | Cancún DEMO · CDMX GTFS oficial |
| 2:15–2:55 | Presentador único | Quién paga y qué obtiene | 89 | Valor para turista y negocio |
| 2:55–3:25 | Presentador único | Tecnología y arquitectura | 66 | Interfaz → API modular → datos |
| 3:25–3:55 | Presentador único | De Cancún a otros estados | 65 | Fuente → adaptador → contrato común |
| 3:55–4:25 | Presentador único | Método y siguiente validación | 64 | Kanban · una entrega funcional cada vez |
| 4:25–5:00 | Presentador único | Por qué apostar por KinHop | 71 | Descubrir → elegir → conectar |

## Discurso para memorizar

Leer solamente los párrafos entre comillas. Los tiempos y las indicaciones no se pronuncian. No improvisar un listado adicional de funciones: cada bloque prepara el siguiente.

### 0:00–0:25 · Una decisión que conecta

> Imagina llegar a Cancún y terminar comiendo en las mismas cadenas que encuentras en casa. El problema no es que falten opciones: es descubrirlas cuando tienes que decidir. Presentamos KinHop: kinship, la afinidad que nos conecta, y hop, un salto. Un salto del turismo habitual hacia la economía local.

### 0:25–0:45 · Qué es y por qué usarla

> KinHop es una aplicación que reúne lugares, eventos, mapa y presupuesto para explorar una ciudad. Nuestro primer usuario es el turista que quiere vivir algo del destino, cerca y dentro de su presupuesto. Puede usarla en español o inglés, desde su teléfono.

### 0:45–1:25 · La diferencia, en una decisión

> La diferencia aparece aquí. El visitante busca Starbucks. KinHop identifica la marca registrada en OpenStreetMap y le muestra alternativas cercanas, junto con la distancia, la fuente y el motivo de la sugerencia. En este ejemplo aparecen opciones entre ciento ochenta y seis y trescientos doce metros. No decimos que un comercio sea local solamente porque no tenga marca registrada: mostramos confianza media. Queremos facilitar una elección informada. La propuesta es conectar el descubrimiento con una alternativa y, después, con el gasto que la persona registra.

### 1:25–1:50 · Del descubrimiento al gasto

> La billetera hace visible esa intención. El turista fija un presupuesto, registra gastos y marca cuáles hizo en negocios locales. Aquí, añadir ciento veinte pesos cambia el indicador del veintidós al veinticuatro por ciento. Es un registro personal, no una medición bancaria ni una prueba de impacto económico. Permanece en su navegador.

### 1:50–2:15 · La ciudad en contexto

> El mapa reúne lugares y transporte para dar contexto al recorrido. Distinguimos datos reales y simulados. Cancún tiene lugares de OpenStreetMap y rutas de demostración; Ciudad de México incorpora la Línea Uno del Metrobús con datos oficiales. No prometemos tiempos en vivo. El turista entiende qué información puede utilizar y sus límites.

### 2:15–2:55 · Quién paga y qué obtiene

> ¿Por qué alguien pagaría? Para un negocio, la propuesta es aparecer cuando un visitante cercano ya está buscando qué hacer o dónde consumir. Proponemos eventos patrocinados, negocios destacados y anuncios identificados. Para el viajero, KinHop Pro propone quitar anuncios y ofrecer cupones con código QR. El precio inicial a validar es cincuenta y nueve pesos mensuales. El acceso básico seguiría siendo gratuito. Hoy mostramos el modelo: los cupones son de demostración y todavía no cobramos ni tenemos AdMob conectado. La disposición a pagar debe comprobarse con usuarios y comercios.

### 2:55–3:25 · Tecnología y arquitectura

> ¿Cómo lo construimos? La interfaz usa React, Vite y Tailwind; MapLibre dibuja el mapa. Una API en Node y Express, escrita en TypeScript, organiza módulos como lugares, eventos y transporte. PostgreSQL guarda la información persistente del servidor. El motor usa reglas explicables, no una caja negra. El acceso utiliza Google y sesiones en el servidor. Cada capa tiene una responsabilidad clara, para poder probarla y cambiarla.

### 3:25–3:55 · De Cancún a otros estados

> Para llegar a otro estado reutilizamos la aplicación. El servidor identifica la ciudad y elige un adaptador: una pieza que traduce su fuente al mismo formato. Registramos la ciudad, incorporamos datos autorizados, validamos calidad y coordenadas, y habilitamos los módulos disponibles. La interfaz consume el mismo contrato. Cancún y Ciudad de México muestran ese enfoque. Expandirnos exige preparar datos locales; no activar un botón mágico.

### 3:55–4:25 · Método y siguiente validación

> Trabajamos con Kanban: tareas pequeñas, una entrega funcional a la vez, pruebas, revisión y documentación. Priorizamos el recorrido completo antes que añadir funciones sueltas. La siguiente validación propuesta es un piloto con turistas y comercios: observar si abren alternativas, si las visitan y si un negocio pagaría por esa exposición. Todavía no presentamos ventas ni impacto comprobado. Ese piloto convertiría nuestra hipótesis en evidencia.

### 4:25–5:00 · Por qué apostar por KinHop

> KinHop une tres necesidades: el turista quiere descubrir, el negocio quiere ser encontrado y ambos necesitan confianza. Ya podemos mostrar el recorrido: buscar, comparar una alternativa cercana y registrar la decisión. La arquitectura permite llevarlo a otros destinos conservando la misma experiencia. Lo que proponemos validar ahora es su valor comercial. Queremos que conocer una ciudad también abra oportunidades para quienes la hacen especial. KinHop: el próximo descubrimiento, que sea local.

## Cómo ensayarlo y usar el video

- Descargar el MP4 antes de exponer. Reproducirlo a pantalla completa y velocidad 1×, con el audio del reproductor silenciado. Su duración es el reloj de la exposición.
- Hacer dos ensayos cronometrados completos. Objetivo: terminar la última frase entre 4:50 y 4:58; dejar que la marca permanezca hasta 5:00. El texto por sí solo no garantiza el tiempo de una persona.
- Revisar los puntos de control: 0:45 empieza la búsqueda; 1:25 billetera; 1:50 mapa; 2:15 negocio; 2:55 arquitectura; 3:25 expansión; 3:55 metodología; 4:25 cierre.
- Aprender las diez anclas, no solo las palabras. Si se pierde una frase, retomar en el siguiente capítulo usando la palabra visible en pantalla. No acelerar para recuperar cada palabra.
- Señalar la alternativa, el medidor y los adaptadores. El resto del tiempo mirar al jurado. No leer los rótulos: desarrollarlos con el discurso.
- Si un ensayo supera 5:30, recortar frases accesorias; no hablar más rápido. No retirar los límites REAL/DEMO ni la aclaración de pagos pendientes.
- Respaldo: el MP4 funciona sin internet. Si falla el proyector, mantener el mismo guion; explicar oralmente «busco una cadena, comparo alternativas y registro el gasto». Si se abre la app en preguntas, reservar esa interacción para después del pitch.

## Preguntas probables del jurado

Todas las responde el presentador; un integrante técnico puede ampliar después si está presente. No se inventan integrantes, entrevistas, convenios, ventas ni costos operativos.

| Pregunta | Respuesta breve y defendible |
|---|---|
| ¿Qué es KinHop? | Una app para descubrir lugares y eventos, comparar alternativas cercanas y organizar presupuesto y recorrido, con foco en negocios locales. |
| ¿Por qué la usaría un turista? | Para descubrir opciones del destino, entender por qué aparecen y tener mapa y presupuesto en una experiencia ES/EN. Es una propuesta de valor que debe contrastarse con usuarios. |
| ¿Por qué pagar y quién paga? | Comercios y organizadores por visibilidad identificada; viajeros por Pro sin anuncios y cupones. Precio inicial Pro propuesto: $59 MXN/mes. Disposición a pagar pendiente. |
| ¿Por qué pagar un mes si el viaje dura pocos días? | Es una hipótesis de precio, no un hábito validado. El piloto debe comparar duración del viaje, utilidad sin anuncios y valor real de los cupones antes de fijar el plan. |
| ¿Cómo conseguirían los primeros usuarios? | Proponemos validar un canal local con comercios y alojamientos que quieran participar; todavía no afirmamos tener alianzas ni adquisición demostrada. |
| ¿Cómo se diferencia de un mapa general? | El recorrido central conecta una cadena con alternativas cercanas explicadas y con un registro personal de gasto local. No afirmamos que otras apps carezcan de todas estas funciones. |
| ¿Qué construyeron y qué es externo? | Interfaz, API modular, adaptadores, motor de reglas y billetera propios. MapLibre renderiza; OSM y GTFS aportan datos; Google identifica al usuario. Se respetan sus fuentes y licencias. |
| ¿Usan inteligencia artificial? | El motor actual usa reglas deterministas y muestra motivo, fuente y confianza; no necesitamos un modelo generativo para esta decisión. |
| ¿Cómo saben que es un negocio local? | OSM aporta etiquetas de marca. Su ausencia es solo una señal; se informa confianza media. Verificar propiedad requiere trabajo adicional con comercios. |
| ¿El 24% prueba impacto económico? | No: corresponde al gasto que registra y clasifica esa persona. No mide transacciones bancarias, visitas efectivas ni retención económica en la ciudad. |
| ¿Es real o simulado? | Capturas reales del prototipo con cuenta DEMO. Lugares OSM y GTFS de CDMX son datos reales; rutas de Cancún, cupones y patrocinios mostrados son DEMO. No hay cobros ni AdMob en producción. |
| ¿Funciona en otro estado? | El diseño reutiliza API y web por ciudad mediante adaptadores. Cada expansión necesita fuentes autorizadas, licencia, normalización, pruebas y catálogo de módulos disponibles. No existe cobertura nacional activa. |
| ¿Cómo evitan publicidad engañosa? | Patrocinios identificados y etiquetas REAL/DEMO. La hipótesis comercial no equivale a una clasificación de propiedad local verificada. |
| ¿Cuáles son los ingresos propuestos? | Anuncios para plan gratis; eventos top 3 a $599/$399/$249 MXN por semana; destacado a $299/mes aún pendiente; anuncio personalizado desde $1,500/mes; Pro $59/mes. Son propuestas, no ingresos comprobados. |
| ¿Cuánto cuesta operar o qué falla con diez veces más usuarios? | Aún no medimos costo por usuario ni carga de producción. Hay que medir base de datos, sesiones y consultas a fuentes antes de dimensionar; no prometemos escalabilidad ilimitada. |
| ¿Qué harían en los siguientes treinta días? | Proponemos un piloto pequeño: comprobar calidad local, medir aperturas de alternativas y visitas con consentimiento, entrevistar comercios y validar precio. No se presenta como un convenio ya firmado. |
| ¿Cómo se trabajó? | Kanban con WIP de una tarjeta, criterios de aceptación, flujos completos, controles de calidad y revisión mediante PR hacia developers. |
| ¿Qué queda pendiente? | Piloto comercial, propiedad local verificada, cobros y red publicitaria, actualización de fuentes y despliegue estable. No ocultamos estos límites. |

## Cobertura y evidencia

- Nombre: afinidad/conexión (*kinship*) + salto (*hop*), según la intención de marca del equipo.
- Arquitectura: `docs/01-architecture/overview.md`; metodología: `docs/agent/WORKFLOW.md`.
- Fuentes y licencias: `docs/06-data/sources.md`. Las distancias y el 22%→24% corresponden al ejemplo grabado; no son estadísticas generales.
- Capturas: `video/demo-jurado/assets/`, 21/11/2026. Guion y tiempos fuente: `video/demo-jurado/storyboard.json`.
- Skills aplicadas: `pitch-timebox` para estructura, presupuesto y ensayo; `judge-sim` para anticipar objeciones. Las notas de evaluación son una revisión orientativa, no puntuación oficial.
