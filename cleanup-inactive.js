import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { execSync } from 'node:child_process';
import { readCache, writeCache } from './utils.js';
import { generateMarkdown } from './build.js';
import fs from 'node:fs';

async function cleanupInactive() {
  const rl = readline.createInterface({ input, output });
  const stars = readCache();

  if (stars.length === 0) {
    console.log('Cache is empty. Please run sync first.');
    rl.close();
    return;
  }

  console.log('--- Remove Inactive Starred Repositories ---');
  const yearsStr = await rl.question('Enter inactivity threshold in years (default: 1.5): ');
  const years = parseFloat(yearsStr) || 1.5;
  const thresholdMs = years * 365 * 24 * 60 * 60 * 1000;
  const thresholdDate = new Date(Date.now() - thresholdMs);

  console.log(`Searching for repositories not updated since: ${thresholdDate.toLocaleDateString()}`);

  const inactive = stars.filter(repo => {
    if (!repo.pushed_at) return false;
    const pushedDate = new Date(repo.pushed_at);
    return pushedDate < thresholdDate;
  });

  if (inactive.length === 0) {
    console.log('No inactive repositories found.');
    rl.close();
    return;
  }

  console.log(`Found ${inactive.length} inactive repositories.\n`);

  let unstarredCount = 0;
  const idsToRemove = new Set();

  for (const repo of inactive) {
    const pushedDate = new Date(repo.pushed_at).toLocaleDateString();
    console.log(`-----------------------------------------------`);
    console.log(`Name:        ${repo.name}`);
    console.log(`Language:    ${repo.language}`);
    console.log(`Last Pushed: ${pushedDate}`);
    console.log(`Description: ${repo.description || 'No description.'}`);
    console.log(`Link:        ${repo.html_url}`);
    
    const answer = await rl.question(`Unstar this repository? (y/N): `);
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log(`Unstarring ${repo.name} on GitHub...`);
      try {
        execSync(`gh api -X DELETE user/starred/${repo.name}`, { stdio: 'ignore' });
        idsToRemove.add(repo.id);
        unstarredCount++;
        console.log(`Successfully unstarred!`);
      } catch (err) {
        console.error(`Failed to unstar ${repo.name} on GitHub: ${err.message}`);
      }
    }
  }

  if (unstarredCount > 0) {
    const updatedStars = stars.filter(repo => !idsToRemove.has(repo.id));
    writeCache('stars_cache.json', updatedStars);
    console.log(`\nRebuilding STARS.md...`);
    const md = generateMarkdown(updatedStars);
    fs.writeFileSync('STARS.md', md, 'utf8');
    console.log(`STARS.md updated.`);
  }

  console.log(`\nCleanup session finished. Unstarred ${unstarredCount} repositories.`);
  rl.close();
}

cleanupInactive().catch(console.error);
