import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { readCache, writeCache } from './utils.js';
import { generateMarkdown } from './build.js';
import fs from 'node:fs';

async function manualTagging() {
  const rl = readline.createInterface({ input, output });
  const stars = readCache();

  if (stars.length === 0) {
    console.log('Cache is empty. Please run sync first.');
    rl.close();
    return;
  }

  console.log('--- GitHub Stars Manual Tagging ---');
  const query = await rl.question('Enter repository name search query: ');
  const matches = stars.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

  if (matches.length === 0) {
    console.log('No matching repositories found.');
    rl.close();
    return;
  }

  console.log('\nMatching Repositories:');
  matches.forEach((repo, idx) => {
    console.log(`[${idx}] ${repo.name} (Current Category: ${repo.category || 'None'}, Tags: ${repo.tags?.join(', ') || 'None'})`);
  });

  const indexStr = await rl.question('\nSelect repo number to edit (or enter to cancel): ');
  if (indexStr.trim() === '') {
    rl.close();
    return;
  }

  const index = parseInt(indexStr, 10);
  if (isNaN(index) || index < 0 || index >= matches.length) {
    console.log('Invalid selection.');
    rl.close();
    return;
  }

  const selectedRepo = matches[index];
  console.log(`\nEditing: ${selectedRepo.name}`);

  const newCategory = await rl.question(`Enter new category [${selectedRepo.category || 'None'}]: `);
  const newTagsStr = await rl.question(`Enter tags (comma separated) [${selectedRepo.tags?.join(', ') || 'None'}]: `);

  // Update
  stars.forEach(item => {
    if (item.id === selectedRepo.id) {
      if (newCategory.trim() !== '') {
        item.category = newCategory.trim();
      }
      if (newTagsStr.trim() !== '') {
        item.tags = newTagsStr.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
  });

  writeCache('stars_cache.json', stars);
  console.log('Updated cache! Rebuilding STARS.md...');
  
  // Auto-update markdown
  const md = generateMarkdown(stars);
  fs.writeFileSync('STARS.md', md, 'utf8');
  console.log('STARS.md updated.');

  rl.close();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  manualTagging().catch(console.error);
}
