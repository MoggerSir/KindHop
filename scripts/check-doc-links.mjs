// Verifica que los enlaces relativos de README, AGENTS, CLAUDE y docs/**/*.md apunten a archivos existentes.
import fs from 'node:fs';
import path from 'node:path';

const roots = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'db/README.md'];
const docs = fs.readdirSync('docs', { recursive: true }).filter((f) => f.endsWith('.md')).map((f) => path.join('docs', f));
let errors = 0;
for (const file of [...roots, ...docs]) {
  const body = fs.readFileSync(file, 'utf8');
  for (const [, target] of body.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (/^(https?:|mailto:)/.test(target)) continue;
    const full = path.resolve(path.dirname(file), decodeURIComponent(target));
    if (!fs.existsSync(full)) {
      console.error(`${file}: enlace roto -> ${target}`);
      errors++;
    }
  }
}
if (errors) process.exit(1);
console.log(`Enlaces de documentación OK (${roots.length + docs.length} archivos)`);
