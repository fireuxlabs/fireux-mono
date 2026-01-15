# Mirror

`mirror/` is a *flat*, generated workspace of symlinks for the files you want to keep “in view” during a task.

## Quick use

1. Edit `mirror/mirror.txt` (add/remove paths).
2. Regenerate: `node scripts/mirror-sync.mjs`.
3. Work from the symlinks in `mirror/` (but edit the real sources under `packages/**`).

## Rules (the “mirror contract”)

- **Source of truth:** `mirror/mirror.txt`.
- **Generated output:** everything in `mirror/` *except* `mirror/README.md` and `mirror/mirror.txt`.
- **Safe to delete:** generated symlinks only. Don’t delete the README or list file as part of normal workflow.
- **Flat only:** no subfolders under `mirror/` (symlinks must live in the `mirror/` root).
- **Never hand-edit symlinks:** don’t create/rename/delete symlinks manually; run the sync script instead.

## What goes in `mirror/mirror.txt`

- One repo-relative path per line.
- You can list a file or a directory.
	- If you list a directory, the sync script will include files under it (recursively).
- Lines starting with `#` are comments.

## Common workflows

- **Clear the mirror:** remove the non-comment lines from `mirror/mirror.txt`, then run `node scripts/mirror-sync.mjs`.
- **Switch focus (“pop” a new set):** edit `mirror/mirror.txt`, then run the sync.

## Notes

- Symlink names are generated to be human-readable; collisions get a numeric suffix (e.g. `--2`).
- If VS Code shows save conflicts while syncing, close any open `mirror/` tabs and rerun the sync (or reload the window).
