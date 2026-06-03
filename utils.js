import fs from 'node:fs';
import path from 'node:path';

export function readCache(filePath = 'stars_cache.json') {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Error reading cache:', e);
    return [];
  }
}

export function writeCache(filePath = 'stars_cache.json', data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing cache:', e);
  }
}
