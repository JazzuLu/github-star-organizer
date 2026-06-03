import { execSync } from 'node:child_process';
import { readCache, writeCache } from './utils.js';

export function mergeStars(existing, incoming) {
  const existingArr = Array.isArray(existing) ? existing : [];
  const existingMap = new Map(existingArr.map(item => [item.id, item]));
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
      `gh api --paginate "user/starred?per_page=100" --jq '.[] | {id: .id, node_id: .node_id, name: .full_name, html_url: .html_url, description: .description, language: .language, pushed_at: .pushed_at}'`,
      { maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' }
    );
    return output
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parsed = JSON.parse(line);
        return {
          id: parsed.id,
          node_id: parsed.node_id,
          name: parsed.name,
          html_url: parsed.html_url,
          description: parsed.description || '',
          language: parsed.language || 'Unknown',
          pushed_at: parsed.pushed_at || ''
        };
      });
  } catch (e) {
    throw new Error(`Failed to fetch stars via gh CLI: ${e.message}`);
  }
}

async function syncAllStars() {
  console.log('Pre-flight checks: Verifying GitHub CLI auth...');
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error("Error: GitHub CLI (gh) is not authenticated or not installed. Please install gh and run 'gh auth login'.");
    process.exit(1);
  }

  console.log('Fetching stars from GitHub via gh CLI...');
  try {
    const allFetched = fetchStarredWithGh();
    const existing = readCache();
    const merged = mergeStars(existing, allFetched);
    writeCache('stars_cache.json', merged);
    console.log(`Sync complete! Total stars stored: ${merged.length}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllStars().catch(console.error);
}
