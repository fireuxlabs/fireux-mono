<!-- FILE: drafts/README.md -->

# Drafts

This folder is used to **draft and review real files before updating production code**.

Draft files:
- usually mirror real file structure
- ignore imports and wiring
- focus on shape, naming, and intent

They are not meant to compile.

## How this is used

1. Copy a real file into `drafts/`
2. Edit it until the shape feels right
3. Promote the changes back into the real file
4. Delete the draft when done (optional)

## Conventions

- Always include a FILE header pointing to the real path
- Imports may be removed or ignored
- Types may be stubbed
- Logic should reflect intended production behaviour

If a draft and a real file disagree, the **draft represents the next intended version**.

## Horizontal snapshots

Sometimes we want to review a whole horizontal slice (e.g. “all cards”, later “all forms”, “all tables”, etc.) as a single collection.

Convention:

- Create a folder under `drafts/<topic>/` (example: `drafts/cards/`).
- Keep it **flat** (no nested directories) so tools like `cat-tree` can scan it easily.
- Every file should start with a header like `<!-- FILE: packages/... -->` pointing back to the real source.
- Use **simple filenames** (e.g. `appCell.vue`, `userProfile.vue`). If there’s ever a collision, prefix with `draft` or add a short suffix.

Workflow:

1. `cd drafts/<topic>`
2. run `cat-tree`
3. use the `FILE:` header to promote changes back to the real file
