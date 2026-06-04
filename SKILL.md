---
name: github-star-organizer
description: Use when the user wants to fetch, synchronize, categorize, search, clean up, or build a catalog of their GitHub starred repositories.
---

# GitHub Star Organizer

## Overview
Organizes a user's GitHub stars into a readable, categorized Markdown catalog (`STARS.md`) using local JSON cache and AI classification driven by the agent. It synchronizes local categories back to GitHub custom Star Lists online and allows interactive cleanup of inactive repositories.

> [!IMPORTANT]
> All project files, scripts, configurations, and cache files are located in the dedicated subdirectory: `/Users/pancraslu/WorkingPlace/github-stars-organizer/`.
> You must run all commands from this subdirectory (e.g. run `npm run <command>` inside `/Users/pancraslu/WorkingPlace/github-stars-organizer`).

## Triggering Context
Use when:
- The user asks to organize, categorize, group, search, or update their GitHub stars.
- The user wants to cleanup or remove stars from inactive or dead repositories.
- The user wants a local `STARS.md` or `stars_cache.json` catalog.
- The user wants to push/sync custom lists back to their online GitHub profile.

## Quick Reference Commands
All commands should be run within `/Users/pancraslu/WorkingPlace/github-stars-organizer/`:
| Command | Action |
| --- | --- |
| `npm run sync` | Pull latest stars from GitHub via `gh` CLI |
| `npm run get-uncategorized` | Output uncategorized stars for the agent |
| `npm run save-categories` | Merge categories from `classifications.json` |
| `npm run build` | Compile cache to `STARS.md` |
| `npm run push` | Create lists and sync categories back to GitHub |
| `npm run cleanup` | Interactive prompt to unstar inactive repositories |
| `npm run tag` | Manually search and edit repository tags |

## Core Process

### 1. Synchronize Stars
Execute `npm run sync`. If `gh` CLI is not logged in, prompt the user to run `gh auth login`.

### 2. Retrieve Uncategorized Items
Run `npm run get-uncategorized` to retrieve items missing a category.

### 3. AI-powered Classification
Analyze the repositories in-context (no external API keys needed). Categorize them into topics (e.g. "AI Coding Assistants", "AI API Utilities", "Web Development", "Web Design").
Output a JSON array of objects:
```json
[
  { "id": 12345, "category": "Web Development", "tags": ["React", "UI"] }
]
```
Save the JSON array to `classifications.json`, run `npm run save-categories`, and delete the temp file.

### 4. Push Categories to GitHub Custom Lists
Run `npm run push`. If it fails with `INSUFFICIENT_SCOPES`, instruct the user to run:
```bash
gh auth refresh -s user
```
This grants the required `user` scope to manipulate custom lists. Re-run `npm run push` once authorized.

### 5. Remove Inactive Stars
Run `npm run cleanup` to identify repositories without pushes for a threshold (e.g. 1.5 years). Interactive prompts will ask the user to verify unstarring.

### 6. Build STARS.md
Run `npm run build` to update the Markdown catalog.

## Common Mistakes & Troubleshooting
- **Error: GraphQL query failed (INSUFFICIENT_SCOPES)**: The active `gh` auth token lacks the `user` scope. Run `gh auth refresh -s user` to authenticate.
- **event loop blocked / large syncs**: The `sync` command supports paginating up to 5,000 repositories using optimized 100-item page size. Do not write manual node loops.
