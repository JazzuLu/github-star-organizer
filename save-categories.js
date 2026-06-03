import fs from 'node:fs';
import { readCache, writeCache } from './utils.js';

const filename = process.argv[2] || 'classifications.json';

if (!fs.existsSync(filename)) {
  console.error(`Error: Classification file '${filename}' not found.`);
  process.exit(1);
}

let classifications;
try {
  classifications = JSON.parse(fs.readFileSync(filename, 'utf8'));
} catch (e) {
  console.error('Failed to parse classifications file:', e.message);
  process.exit(1);
}

if (!Array.isArray(classifications)) {
  console.error('Error: Classifications must be a JSON array.');
  process.exit(1);
}

const cache = readCache();
const classificationMap = new Map(classifications.map(c => [c.id, c]));

let updatedCount = 0;
cache.forEach(item => {
  const match = classificationMap.get(item.id);
  if (match) {
    item.category = match.category;
    item.tags = Array.isArray(match.tags) ? match.tags : [];
    updatedCount++;
  }
});

writeCache('stars_cache.json', cache);
console.log(`Successfully updated ${updatedCount} repositories in stars_cache.json.`);
