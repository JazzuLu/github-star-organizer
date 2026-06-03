import { readCache } from './utils.js';

const cache = readCache();
const uncategorized = cache.filter(item => !item.category);

console.log(JSON.stringify(uncategorized.map(item => ({
  id: item.id,
  name: item.name,
  description: item.description,
  language: item.language
})), null, 2));
