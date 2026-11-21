// Comprueba los JSON de idiomas de la web (regla: todo texto visible vive en ellos).
// 1) Todos los idiomas tienen exactamente las mismas claves que es.json (referencia).
// 2) Ningún texto vacío y las mismas {variables} en cada idioma.
// 3) Toda clave literal usada en el código con t('…') existe.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../apps/web/src/', import.meta.url));
const localesDir = join(root, 'shared/i18n/locales');
const REFERENCE = 'es';

function flatten(node, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') flatten(value, path, out);
    else out.set(path, value);
  }
  return out;
}
const vars = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const errors = [];
const locales = {};
for (const file of (await readdir(localesDir)).filter((f) => f.endsWith('.json'))) {
  locales[file.replace('.json', '')] = flatten(JSON.parse(await readFile(join(localesDir, file), 'utf8')));
}
const ref = locales[REFERENCE];
if (!ref) throw new Error(`Falta ${REFERENCE}.json en ${localesDir}`);

for (const [locale, keys] of Object.entries(locales)) {
  for (const [key, text] of keys) {
    if (typeof text !== 'string' || !text.trim()) errors.push(`${locale}.json: "${key}" vacío o no es texto`);
    if (locale !== REFERENCE && !ref.has(key)) errors.push(`${locale}.json: "${key}" sobra (no está en ${REFERENCE}.json)`);
  }
  if (locale === REFERENCE) continue;
  for (const [key, text] of ref) {
    if (!keys.has(key)) errors.push(`${locale}.json: falta "${key}"`);
    else if (vars(text) !== vars(keys.get(key))) errors.push(`${locale}.json: "${key}" usa variables {${vars(keys.get(key))}} y ${REFERENCE}.json {${vars(text)}}`);
  }
}

async function* sourceFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.jsx?$/.test(entry.name)) yield full;
  }
}
let used = 0;
for await (const file of sourceFiles(root)) {
  const code = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''); // sin comentarios
  for (const [, key] of code.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) {
    used++;
    if (!ref.has(key)) errors.push(`${file.replace(root, 'src/')}: t('${key}') no existe en ${REFERENCE}.json`);
  }
}

if (errors.length) {
  console.error(`Idiomas con errores:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Idiomas OK (${Object.keys(locales).join(', ')} · ${ref.size} claves · ${used} usos literales de t())`);
