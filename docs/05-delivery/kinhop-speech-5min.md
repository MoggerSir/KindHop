# KinHop — speech para aprender y presentar

**Apoyo visual de 5:00 · 635 palabras · una persona.** Las marcas de tiempo no se pronuncian. Empezar con el video desde 0:00, a velocidad 1×. Ensayar dos veces: la duración de la voz depende del ritmo del presentador.

## 0:00–0:25 · Una decisión que conecta

Imagina llegar a Cancún y terminar comiendo en las mismas cadenas que encuentras en casa. El problema no es que falten opciones: es descubrirlas cuando tienes que decidir. Presentamos KinHop: kinship, la afinidad que nos conecta, y hop, un salto. Un salto del turismo habitual hacia la economía local.

## 0:25–0:45 · Qué es y por qué usarla

KinHop es una aplicación que reúne lugares, eventos, mapa y presupuesto para explorar una ciudad. Nuestro primer usuario es el turista que quiere vivir algo del destino, cerca y dentro de su presupuesto. Puede usarla en español o inglés, desde su teléfono.

## 0:45–1:25 · La diferencia, en una decisión

La diferencia aparece aquí. El visitante busca Starbucks. KinHop identifica la marca registrada en OpenStreetMap y le muestra alternativas cercanas, junto con la distancia, la fuente y el motivo de la sugerencia. En este ejemplo aparecen opciones entre ciento ochenta y seis y trescientos doce metros. No decimos que un comercio sea local solamente porque no tenga marca registrada: mostramos confianza media. Queremos facilitar una elección informada. La propuesta es conectar el descubrimiento con una alternativa y, después, con el gasto que la persona registra.

## 1:25–1:50 · Del descubrimiento al gasto

La billetera hace visible esa intención. El turista fija un presupuesto, registra gastos y marca cuáles hizo en negocios locales. Aquí, añadir ciento veinte pesos cambia el indicador del veintidós al veinticuatro por ciento. Es un registro personal, no una medición bancaria ni una prueba de impacto económico. Permanece en su navegador.

## 1:50–2:15 · La ciudad en contexto

El mapa reúne lugares y transporte para dar contexto al recorrido. Distinguimos datos reales y simulados. Cancún tiene lugares de OpenStreetMap y rutas de demostración; Ciudad de México incorpora la Línea Uno del Metrobús con datos oficiales. No prometemos tiempos en vivo. El turista entiende qué información puede utilizar y sus límites.

## 2:15–2:55 · Quién paga y qué obtiene

¿Por qué alguien pagaría? Para un negocio, la propuesta es aparecer cuando un visitante cercano ya está buscando qué hacer o dónde consumir. Proponemos eventos patrocinados, negocios destacados y anuncios identificados. Para el viajero, KinHop Pro propone quitar anuncios y ofrecer cupones con código QR. El precio inicial a validar es cincuenta y nueve pesos mensuales. El acceso básico seguiría siendo gratuito. Hoy mostramos el modelo: los cupones son de demostración y todavía no cobramos ni tenemos AdMob conectado. La disposición a pagar debe comprobarse con usuarios y comercios.

## 2:55–3:25 · Tecnología y arquitectura

¿Cómo lo construimos? La interfaz usa React, Vite y Tailwind; MapLibre dibuja el mapa. Una API en Node y Express, escrita en TypeScript, organiza módulos como lugares, eventos y transporte. PostgreSQL guarda la información persistente del servidor. El motor usa reglas explicables, no una caja negra. El acceso utiliza Google y sesiones en el servidor. Cada capa tiene una responsabilidad clara, para poder probarla y cambiarla.

## 3:25–3:55 · De Cancún a otros estados

Para llegar a otro estado reutilizamos la aplicación. El servidor identifica la ciudad y elige un adaptador: una pieza que traduce su fuente al mismo formato. Registramos la ciudad, incorporamos datos autorizados, validamos calidad y coordenadas, y habilitamos los módulos disponibles. La interfaz consume el mismo contrato. Cancún y Ciudad de México muestran ese enfoque. Expandirnos exige preparar datos locales; no activar un botón mágico.

## 3:55–4:25 · Método y siguiente validación

Trabajamos con Kanban: tareas pequeñas, una entrega funcional a la vez, pruebas, revisión y documentación. Priorizamos el recorrido completo antes que añadir funciones sueltas. La siguiente validación propuesta es un piloto con turistas y comercios: observar si abren alternativas, si las visitan y si un negocio pagaría por esa exposición. Todavía no presentamos ventas ni impacto comprobado. Ese piloto convertiría nuestra hipótesis en evidencia.

## 4:25–5:00 · Por qué apostar por KinHop

KinHop une tres necesidades: el turista quiere descubrir, el negocio quiere ser encontrado y ambos necesitan confianza. Ya podemos mostrar el recorrido: buscar, comparar una alternativa cercana y registrar la decisión. La arquitectura permite llevarlo a otros destinos conservando la misma experiencia. Lo que proponemos validar ahora es su valor comercial. Queremos que conocer una ciudad también abra oportunidades para quienes la hacen especial. KinHop: el próximo descubrimiento, que sea local.

Escaleta, indicaciones de ensayo y respuestas a preguntas del jurado: [PITCH.md](../../PITCH.md).
