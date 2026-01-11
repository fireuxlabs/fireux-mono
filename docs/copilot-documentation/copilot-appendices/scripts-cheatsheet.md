---
title: Scripts & Commands Cheatsheet
status: working
updated: 2026-01-11
---

# Scripts & Commands Cheatsheet

This appendix is the quick map from `pnpm` commands → underlying files in `scripts/`.

## Dev servers

- `pnpm dev:fireux` → frees port 3000 via `scripts/free-port.mjs`, then runs the FireUX app dev server.
- `pnpm dev:misebox` / `pnpm dev:cleanbox` / `pnpm dev:niederhorn` / `pnpm dev:richies` / `pnpm dev:tenant`
- `pnpm dev:all` / `pnpm dev:all-extended` → runs multiple dev servers via `concurrently`.

## Repo guards + save flow

- `pnpm guard` → `scripts/guard.mjs` (composes checks in `scripts/guards/*.mjs`).
- `pnpm pre-guard-clean` → `scripts/pre-guard-clean.mjs` (repo hygiene before guard).
- `pnpm gitsave` → `scripts/gitsave.sh` (guarded save/push workflow).

## Cleaning

- `pnpm clean` → `scripts/clean.mjs`
- `pnpm clean:deep` → `scripts/clean.mjs --deep`

## CTA generation

- `pnpm gen:cta-innards` → `scripts/generate-cta-innards.mjs`
- `pnpm gen:cta-trees` → `scripts/generate-cta-parent-trees.mjs`

## App media maintenance (destructive)

- `pnpm audit:app-media` → `scripts/audit-app-media.mjs`
- `pnpm list:app-media-trash` → `scripts/list-app-media-trash.mjs`
- `pnpm delete:app-media-trash` → `scripts/delete-app-media-trash.mjs`
- `pnpm delete:app-media-folders` → `scripts/delete-app-media-folders.mjs`
- `pnpm sync:app-media-from-public` → `scripts/sync-app-media-from-public.mjs`

## Firestore maintenance / migrations (destructive)

- `pnpm clear:app-fields` → `scripts/clear-app-firestore-fields.mjs`
- One-off migration scripts live as standalone files in `scripts/` (examples: `scripts/migrate-places-canonical.mjs`).

## Safety notes

- Prefer `pnpm <script>` over running `node scripts/...` directly.
- Assume anything that writes to Firestore or Storage is destructive unless it explicitly says otherwise.
- If you add new migration/maintenance scripts, prefer supporting `--dry-run` + `--apply` and documenting flags at the top of the file.
