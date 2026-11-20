import { existsSync } from 'node:fs';

// Carga apps/api/.env si existe (Node >= 22, sin dependencia dotenv).
const envFile = new URL('../../.env', import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);
