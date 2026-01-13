# Mirror
Live mirror (symlinks).

- `mirror/` is safe to delete/recreate.
- Do not use subfolders under `mirror/`.
- All mirror symlinks must live in the `mirror/` root.
- All mirror symlinks must have human-readable key-id file names (not full paths).
- Mirror contents are generated symlinks (not copies).
- Never edit files in `mirror/`.
- Always edit real files under `packages/**`.

## How mirror is generated

- Source of truth: `mirror/mirror.txt` (one repo-relative file path per line)
- Regenerate symlinks: `node scripts/mirror-sync.mjs`

Notes:
- The sync script flattens paths into short, readable key ids and will add a numeric suffix if needed to avoid collisions.
- Don’t hand-create or rename symlinks in `mirror/`; they’ll be deleted on the next sync.

## Naming convention (key ids)

Mirror symlink names are intentionally short “key ids” so you can scan/search them quickly.

- Names include a package slug prefix (e.g. `core`, `jobs`, `places`) plus a meaningful tail (e.g. `dev-HealthPanel.vue`).
- Names should *not* include full `src/runtime/...` paths.
- Collisions are resolved by appending `--2`, `--3`, etc.

Examples:

- `core-dev-HealthPanel.vue`
- `core-dev-index.vue`
- `core-api-dev-images.get.ts`
- `jobs-dev-fireux-jobs.vue`

## Glossary

- **mirror**: The generated set of symlinks in `mirror/` pointing to real files elsewhere in the repo.
- **source of truth**: `mirror/mirror.txt` (the list of repo-relative paths that should be mirrored).
- **sync**: Regenerating the symlinks by running `node scripts/mirror-sync.mjs`.
- **pop**: Short for “populate”. Add/update entries in `mirror/mirror.txt` so the next sync produces the intended set of mirror symlinks.
- **mirror pop**: Populate + sync the mirror according to a specific intent (e.g. “mirror pop all dev based components”).
- **clear**: Remove generated mirror symlinks so `mirror/` contains only `README.md` and `mirror.txt`.
- **key id**: The short, human-readable symlink file name created by the sync script (package slug + meaningful tail).

### Operator phrases

When you say: **“mirror pop …”**, treat it as an instruction to:

1. Update `mirror/mirror.txt` to include the requested set of files.
2. Run `node scripts/mirror-sync.mjs` to regenerate `mirror/`.

When you say: **“mirror clear”**, treat it as an instruction to:

1. Ensure `mirror/mirror.txt` is empty (or contains only comments).
2. Run `node scripts/mirror-sync.mjs` to remove all generated symlinks.
