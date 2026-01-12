# Mirror
Live mirror (symlinks).

- `mirror/` is safe to delete/recreate.
- Do not use subfolders under `mirror/`.
- All mirror symlinks must live in the `mirror/` root.
- All mirror symlinks must have human-readable file names.
- Mirror contents are generated symlinks (not copies).
- Never edit files in `mirror/`.
- Always edit real files under `packages/**`.

## How mirror is generated

- Source of truth: `mirror/mirror.txt` (one repo-relative file path per line)
- Regenerate symlinks: `node scripts/mirror-sync.mjs`

Notes:
- The sync script flattens paths into readable names and will add a numeric suffix if needed to avoid collisions.
- Don’t hand-create or rename symlinks in `mirror/`; they’ll be deleted on the next sync.
