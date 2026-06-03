import fs from 'node:fs';
import path from 'node:path';

export function readCache(filePath = 'stars_cache.json') {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading cache:', e);
    return [];
  }
}

export function writeCache(filePath = 'stars_cache.json', data) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing cache:', e);
  }
}
