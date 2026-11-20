# Módulo: incidencias urbanas

**Objetivo:** mostrar reportes comunitarios de encharcamientos/inundaciones, con fecha y nivel de verificación. No es una fuente oficial de seguridad.

**Datos mínimos:** ciudad, coordenadas aproximadas, descripción, foto opcional, `createdAt`, `expiresAt`, `status` (`unverified`, `confirmed`, `resolved`, `rejected`), origen, conteo de corroboraciones.

**MVP:** usuario crea reporte con validación/rate limiting básico, moderador confirma/rechaza, marcadores expiran y panel indica hora. Para demo se permiten reportes simulados con etiqueta prominente `DEMO`.

**Seguridad:** evitar exponer domicilio/ubicación histórica del informante; proteger uploads; evitar spam; no dirigir usuarios por zonas potencialmente peligrosas basándose solo en reportes no verificados.
