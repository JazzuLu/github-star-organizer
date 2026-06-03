import fs from 'node:fs';
import { readCache } from './utils.js';

export function generateMarkdown(stars) {
  const groups = {};
  const uncategorizedKey = 'Uncategorized';

  stars.forEach(item => {
    const cat = item.category || uncategorizedKey;
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
  });

  let md = `# My GitHub Stars Catalog\n\n`;
  md += `*Generated automatically on ${new Date().toLocaleDateString()}*\n\n`;

  // Sort categories, placing 'Uncategorized' at the end
  const categories = Object.keys(groups).sort((a, b) => {
    if (a === uncategorizedKey) return 1;
    if (b === uncategorizedKey) return -1;
    return a.localeCompare(b);
  });

  categories.forEach(category => {
    md += `## ${category}\n\n`;
    const sortedRepos = groups[category].sort((a, b) => a.name.localeCompare(b.name));
    sortedRepos.forEach(repo => {
      const tagString = repo.tags && repo.tags.length > 0
        ? repo.tags.map(t => `\`[${t}]\``).join(' ')
        : '';
      md += `- [${repo.name}](${repo.html_url}) - ${repo.description || 'No description.'} ${tagString}\n`;
    });
    md += `\n`;
  });

  return md;
}

function runBuild() {
  const stars = readCache();
  if (stars.length === 0) {
    console.log('No cache found. Run npm run sync first.');
    return;
  }
  const md = generateMarkdown(stars);
  fs.writeFileSync('STARS.md', md, 'utf8');
  console.log('Successfully updated STARS.md!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBuild();
}
