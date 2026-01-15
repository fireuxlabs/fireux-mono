## What a cleared mirror looks like

After clearing, your `mirror/mirror.txt` should look like:

	# Live mirror list (source of truth for generated symlinks in mirror/)
	#
	# How to use:
	# 1) Add/remove repo-relative file paths (or directories) below.
	# 2) Run: node scripts/mirror-sync.mjs
	#
	# Rules:
	# - One repo-relative path per line (file OR directory).
	# - Directories are expanded recursively into files.
	# - Lines starting with # are ignored.
	# - Do not hand-edit symlinks in mirror/; re-run the sync.
	# - To “clear the mirror”, remove all non-comment lines and re-run the sync.
    
	# (empty)

And your `mirror/` directory should contain only:

	mirror/README.md
	mirror/mirror.txt

No other files or symlinks should remain after a successful clear.

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
- **To set a custom symlink name:** add `# your-name.ts` after the path. Example:

			packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts # app-interface.ts

	This will create a symlink named `app-interface.ts` in `mirror/`.

## Naming convention for symlinks

- If you add a `# name` comment after a path, that will be used as the symlink name (e.g. `user-interface.ts`).
- If you don’t specify a name, the script will generate a readable name from the path.

This makes it easy to keep the mirror directory clean and human-friendly for any set of files.

## Common workflows

- **Clear the mirror:** remove the non-comment lines from `mirror/mirror.txt`, then run `node scripts/mirror-sync.mjs`.
- **Switch focus (“pop” a new set):** edit `mirror/mirror.txt`, then run the sync.

## Troubleshooting: Mirror not clearing?

If you clear `mirror/mirror.txt` and run the sync but files still remain in `mirror/`, they may be leftover symlinks or files not removed by the script.

- **To force-remove everything except the docs/list:**

	```sh
	find mirror/ ! -name 'README.md' ! -name 'mirror.txt' -delete
	```

- After running this, only `README.md` and `mirror.txt` should remain in `mirror/`.

- If you see save conflicts in VS Code, close any open `mirror/` tabs and rerun the sync (or reload the window).

## Notes

- Symlink names are generated to be human-readable; collisions get a numeric suffix (e.g. `--2`).
