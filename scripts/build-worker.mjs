import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
let source = readFileSync(resolve(root, 'worker/logic.js'), 'utf8');
for (const [marker, file] of [
  ['__PAGE_HTML__', 'dist/index.html'],
  ['__FOOD_CATALOG_JS__', 'dist/food-catalog.js'],
  ['__FOOD_ALL_JS__', 'dist/food-all.js']
]) {
  source = source.replace(marker, JSON.stringify(readFileSync(resolve(root, file), 'utf8')));
}
mkdirSync(resolve(root, 'dist/server'), { recursive: true });
writeFileSync(resolve(root, 'dist/server/index.js'), source);
console.log('Worker built with health journal page and food catalogs.');
