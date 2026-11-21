# Política de datos, privacidad y seguridad

- Minimizar datos personales: no retener historial de ubicación sin necesidad; permiso explícito y revocable.
- Fotografías/reportes con moderación y caducidad; no publicar ubicaciones sensibles por defecto.
- Gastos personales sin credenciales bancarias; importaciones CSV locales o backend autenticado (según evolución).
- Validar entradas con schemas en API, parametrizar SQL, CORS limitado a origen autorizado y rate-limit para reportes.
- Usar credenciales en env local no commit; `.env.example` solo placeholders.
- Separar valores `REAL`, `DEMO`, `UNVERIFIED`, fuentes y timestamps; en UI indicar información no confirmada.
- Acceso a fuentes externas conforme a licencias/términos; no scraping prohibido ni simulaciones vendidas como live (las rutas simuladas de Cancún y las fotos genéricas van siempre como DEMO, ADR-0008).
