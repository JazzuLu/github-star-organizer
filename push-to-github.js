import { execSync } from 'node:child_process';
import { readCache } from './utils.js';

// Helper to run GraphQL queries with gh CLI
function runGraphQL(query, variables = {}) {
  let args = [];
  for (const [key, value] of Object.entries(variables)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        args.push(`-F "${key}[]"`);
      } else {
        value.forEach(item => {
          args.push(`-F "${key}[]=${item}"`);
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      args.push(`-F ${key}='${JSON.stringify(value)}'`);
    } else if (typeof value === 'boolean') {
      args.push(`-F ${key}=${value}`);
    } else {
      args.push(`-F ${key}="${String(value).replace(/"/g, '\\"')}"`);
    }
  }

  const queryEscaped = query.replace(/'/g, "'\\''");
  const cmd = `gh api graphql -f query='${queryEscaped}' ${args.join(' ')}`;
  try {
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return JSON.parse(output);
  } catch (e) {
    const stderr = e.stderr ? e.stderr.toString() : '';
    if (stderr.includes('INSUFFICIENT_SCOPES') || stderr.includes('required scopes')) {
      throw new Error(`\nGraphQL API Scope Error: Your GitHub token is missing the 'user' scope required to manage Star Lists.\nTo fix this, please run the following command in your terminal and authorize user scopes:\n\n    gh auth refresh -s user\n`);
    }
    throw new Error(`GraphQL query failed: ${e.message}\nStderr: ${stderr}\nCommand: ${cmd}`);
  }
}

async function pushToGitHub() {
  console.log('Pre-flight checks: Verifying GitHub CLI auth...');
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch {
    console.error("Error: GitHub CLI (gh) is not authenticated or not installed. Please install gh and run 'gh auth login'.");
    process.exit(1);
  }

  const stars = readCache();
  if (stars.length === 0) {
    console.log('Cache is empty. Please run sync first.');
    return;
  }

  console.log('Fetching your online Star Lists from GitHub...');
  const queryLists = `
    query {
      viewer {
        lists(first: 100) {
          nodes {
            id
            name
            items(first: 100) {
              nodes {
                ... on Repository {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  let response;
  try {
    response = runGraphQL(queryLists);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  const listNodes = response?.data?.viewer?.lists?.nodes || [];
  
  // Maps to track lists and their current items
  const nameToIdMap = new Map();
  const listItemsMap = new Map(); // listId -> Set of repository node_ids

  listNodes.forEach(list => {
    nameToIdMap.set(list.name.toLowerCase(), list.id);
    const repoIds = new Set(list.items.nodes.map(item => item.id));
    listItemsMap.set(list.id, repoIds);
  });

  const createListMutation = `
    mutation($name: String!) {
      createUserList(input: { name: $name }) {
        list {
          id
          name
        }
      }
    }
  `;

  const addToListMutation = `
    mutation($itemId: ID!, $listIds: [ID!]!) {
      updateUserListsForItem(input: { itemId: $itemId, listIds: $listIds }) {
        clientMutationId
      }
    }
  `;

  let addedCount = 0;

  for (const repo of stars) {
    if (!repo.category) continue;
    if (!repo.node_id) {
      console.warn(`Warning: Repository ${repo.name} has no node_id. Skip pushing.`);
      continue;
    }

    const categoryName = repo.category;
    let listId = nameToIdMap.get(categoryName.toLowerCase());

    // Intelligent fallback: Try matching category to existing lists if name matches partially
    if (!listId) {
      const sortedLists = Array.from(nameToIdMap.entries()).sort((a, b) => b[0].length - a[0].length);
      for (const [listName, existingId] of sortedLists) {
        if (categoryName.toLowerCase().includes(listName) || listName.includes(categoryName.toLowerCase())) {
          listId = existingId;
          console.log(`[Heuristic] Mapping category "${categoryName}" to existing list "${listName}"`);
          break;
        }
      }
    }

    // Create list if it doesn't exist and fallback failed
    if (!listId) {
      console.log(`Creating list "${categoryName}" on GitHub...`);
      try {
        const createRes = runGraphQL(createListMutation, { name: categoryName });
        const newList = createRes?.data?.createUserList?.list;
        if (newList) {
          listId = newList.id;
          nameToIdMap.set(categoryName.toLowerCase(), listId);
          listItemsMap.set(listId, new Set());
          console.log(`Successfully created list "${categoryName}" with ID ${listId}`);
        } else {
          console.error(`Failed to create list "${categoryName}"`);
          continue;
        }
      } catch (err) {
        console.error(`Warning: Cannot create list "${categoryName}" on GitHub: ${err.message.split('\n')[0]}`);
        continue; // Skip items in this category since list cannot be created
      }
    }

    const currentRepos = listItemsMap.get(listId);
    if (currentRepos && currentRepos.has(repo.node_id)) {
      // Already in list, skip
      continue;
    }

    // Add to list
    console.log(`Adding ${repo.name} to list "${categoryName}"...`);
    try {
      runGraphQL(addToListMutation, { itemId: repo.node_id, listIds: [listId] });
      currentRepos.add(repo.node_id);
      addedCount++;
    } catch (err) {
      console.error(`Error adding ${repo.name} to list:`, err.message.split('\n')[0]);
    }
  }

  console.log(`\nSync complete! Associated ${addedCount} repository stars to online lists on GitHub.`);
}

pushToGitHub().catch(console.error);
