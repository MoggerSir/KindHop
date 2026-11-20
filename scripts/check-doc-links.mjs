import fs from 'node:fs';
import path from 'node:path';
const files=['README.md','docs/INDEX.md','AGENTS.md','CLAUDE.md'];
let errors=0;
for(const file of files){
 const body=fs.readFileSync(file,'utf8');
 for(const match of body.matchAll(/\]\(([^)#]+)(?:#[^)]+)?\)/g)){
  if(/^https?:|^mailto:/.test(match[1]))continue;
  const full=path.resolve(path.dirname(file),decodeURIComponent(match[1]));
  if(!fs.existsSync(full)){console.error(`${file}: missing ${match[1]}`);errors++;}
 }
}
if(errors)process.exit(1);
console.log('Markdown navigation links: OK');
