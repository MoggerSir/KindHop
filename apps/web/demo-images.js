import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Genera variantes AVIF y WebP de las fotos DEMO (eventos y lugares) para que el móvil no baje el JPEG de 960 px
// cuando el hueco mide 80–380 px. El JPEG original se queda como respaldo: la apariencia no cambia de encuadre.
const root = fileURLToPath(new URL('.', import.meta.url));
const demoDir = join(root, 'public/demo');
const manifestPath = join(root, 'src/shared/lib/demo-image-manifest.js');
const WIDTHS = [320, 480, 640, 960];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith('.jpg')) out.push(path);
  }
  return out;
}

async function writeVariant(file, width, naturalWidth, dest, format) {
  try {
    const [srcStat, destStat] = await Promise.all([stat(file), stat(dest)]);
    if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 0) return;
  } catch {
    // La variante todavía no existe.
  }
  let pipeline = sharp(file, { failOn: 'none' });
  if (width !== naturalWidth) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  pipeline = format === 'webp' ? pipeline.webp({ quality: 82, effort: 4 }) : pipeline.avif({ quality: 52, effort: 4 });
  await pipeline.toFile(dest);
}

export async function generateDemoImages() {
  const files = (await walk(demoDir)).sort();
  const manifest = {};
  for (const file of files) {
    const meta = await sharp(file, { failOn: 'none' }).metadata();
    const natural = meta.width ?? 960;
    const widths = WIDTHS.filter((w) => w < natural);
    if (!widths.includes(natural)) widths.push(natural);
    widths.sort((a, b) => a - b);
    const base = file.replace(/\.jpg$/, '');
    for (const width of widths) {
      await writeVariant(file, width, natural, `${base}-${width}.webp`, 'webp');
      await writeVariant(file, width, natural, `${base}-${width}.avif`, 'avif');
    }
    const url = `/${relative(join(root, 'public'), file).split('\\').join('/')}`;
    manifest[url] = { width: natural, height: meta.height ?? natural, widths };
  }
  const body = `// Generado por apps/web/demo-images.js a partir de public/demo/**/*.jpg. No editar a mano.\nexport const demoImageManifest = ${JSON.stringify(manifest, null, 2)};\n`;
  const current = await readFile(manifestPath, 'utf8').catch(() => '');
  if (current !== body) await writeFile(manifestPath, body);
  return manifest;
}

export function demoImagesPlugin() {
  let pending;
  const run = () => {
    pending ??= generateDemoImages().catch((err) => {
      pending = null;
      throw err;
    });
    return pending;
  };
  return {
    name: 'demo-images',
    buildStart: run,
    configureServer: run,
  };
}
