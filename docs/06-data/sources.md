# Registro de fuentes y procedencia

**No se han validado integraciones en el bootstrap:** este registro indica fuentes candidatas, no conexiones activas.

| Fuente | Ciudad | Datos | Estado | Acciones requeridas |
|---|---|---|---|---|
| API pública Rutas Cancún | Cancún | Rutas, paradas, trazos | POR VALIDAR | URL, permiso, disponibilidad, términos, versión |
| Gobierno municipal/estatal | Cancún | Supermanzanas, eventos | POR VALIDAR | GeoJSON o shapefile, licencia, vigencia |
| OpenStreetMap/Overpass | Ambas | POI, calles | POR VALIDAR | ODbL/atribución, límites de consulta y proveedores de teselas |
| Portal de datos CDMX | CDMX | GTFS, distritos | POR VALIDAR | Fecha de datos, endpoints, licencia |
| Comunidad KindHop | Ambas | Reportes urbanos | POR CREAR | Privacidad, expiración, moderación |
| Datos introducidos por usuario | Ambas | Presupuesto y gastos | POR CREAR | Seguridad, aislamiento, minimización |

**Cada dataset real debe registrar:** `sourceName`, `sourceUrl`, `license`, `retrievedAt`, `updatedAt` si existe, `cityId`, `status` y responsable. `DEMO` separado de `LIVE`.
