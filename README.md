# GitHub Star Organizer

[![skills.sh](https://skills.sh/b/JazzuLu/github-star-organizer)](https://skills.sh/JazzuLu/github-star-organizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight Node.js toolset and Agent Skill designed to curate, organize, and manage your GitHub starred repositories. It compiles your stars into a clean Markdown catalog (`STARS.md`), groups them into consolidated categories, synchronizes them back to your online GitHub profile as Star Lists/Collections, and helps you prune long-inactive repositories.

---

## ✨ Features

- 🔄 **Incremental Synchronization**: Pulls your starred repositories using optimized GraphQL / REST pagination via the GitHub CLI.
- 🗂️ **Automated Categorization**: Curates and compiles metadata, tags, and languages into a structured cache database (`stars_cache.json`).
- 📝 **Markdown Catalog**: Compiles the cache into a beautifully sorted, readable directory (`STARS.md`).
- 📤 **GitHub Star Lists Sync**: Cleans up garbage or fine-grained residual Star Lists on GitHub online and synchronizes your consolidated categories back to GitHub.
- 🧹 **Interactive Pruning**: Identifies repositories with no updates for a long time (e.g., 1.5+ years) and prompts you to unstar them.

---

## 🚀 Installation & Usage

### 1. As an Agent Skill (skills.sh)
If you are using **Claude Code**, **Cursor**, **Gemini**, or other compatible AI coding agents, you can install this skill directly using the `skills` package manager:

```bash
npx skills add JazzuLu/github-star-organizer
```

This registers the skill instructions in your agent's configuration, giving your AI coding assistant the ability to run sync, organize, and prune workflows automatically.

---

### 2. Manual CLI Setup
To run the scripts manually on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JazzuLu/github-star-organizer.git
   cd github-star-organizer
   ```

2. **Install dependencies:**
   This project is designed to be lightweight with zero runtime dependencies. Running `npm install` is only required for running the test suite:
   ```bash
   npm install
   ```

3. **Verify GitHub CLI Authentication:**
   The scripts interact with the GitHub API via the official `gh` CLI. Ensure you are authenticated and have the necessary `user` scope to manage Star Lists:
   ```bash
   gh auth status
   # If you need to log in:
   gh auth login
   # If you need to refresh scopes to manage custom Star Lists:
   gh auth refresh -s user
   ```

---

## 🛠️ CLI Script Reference

Run these commands inside the `github-star-organizer` directory:

| Script | Command | Description |
| --- | --- | --- |
| **Sync** | `npm run sync` | Pulls your starred repositories and updates `stars_cache.json`. |
| **Get Uncategorized** | `npm run get-uncategorized` | Outputs list of stars currently missing a category. |
| **Save Categories** | `npm run save-categories` | Saves manual or AI classification tags back to the cache. |
| **Build Catalog** | `npm run build` | Renders `stars_cache.json` into a beautifully sorted `STARS.md`. |
| **Push to GitHub** | `npm run push` | Creates custom Star Lists on your GitHub profile and pushes categorized repos. |
| **Clean Inactive** | `npm run cleanup` | Scans for repositories inactive for >1.5 years and interactively prompts to unstar. |
| **Tag Editor** | `npm run tag` | Launches a terminal UI to manually edit tags for starred repos. |
| **Test** | `npm test` | Runs the test suite. |

---

## 🧪 Testing

To run the test suite and verify the caching and merging utilities:

```bash
npm test
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
