import { execSync } from 'node:child_process';
import { readCache, writeCache } from './utils.js';

export function mergeStars(existing, incoming) {
  const existingMap = new Map(existing.map(item => [item.id, item]));
  return incoming.map(inc => {
    const exist = existingMap.get(inc.id);
    if (exist) {
      return {
        ...inc,
        category: exist.category || undefined,
        tags: exist.tags || []
      };
    }
    return {
      ...inc,
      category: undefined,
      tags: []
    };
  });
}

export function fetchStarredWithGh() {
  try {
    const output = execSync(
      `gh api --paginate "user/starred" --jq '.[] | {id: .id, name: .full_name, html_url: .html_url, description: .description, language: .language}'`,
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' }
    );
    return output
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parsed = JSON.parse(line);
        return {
          id: parsed.id,
          name: parsed.name,
          html_url: parsed.html_url,
          description: parsed.description || '',
          language: parsed.language || 'Unknown'
        };
      });
  } catch (e) {
    console.error('Error fetching stars via gh CLI:', e.message);
    process.exit(1);
  }
}

async function syncAllStars() {
  console.log('Fetching stars from GitHub via gh CLI...');
  const allFetched = fetchStarredWithGh();
  const existing = readCache();
  const merged = mergeStars(existing, allFetched);
  writeCache('stars_cache.json', merged);
  console.log(`Sync complete! Total stars stored: ${merged.length}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllStars().catch(console.error);
}
