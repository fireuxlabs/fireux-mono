# Mirror
Live mirror (symlinks).

- `mirror/` is safe to delete/recreate.
- Do not use subfolders under `mirror/`.
- All mirror symlinks must live in the `mirror/` root.
- Mirror contents are generated symlinks (not copies).
- Never edit files in `mirror/`.
- Always edit real files under `packages/**`.
