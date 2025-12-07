# How to work on a single app/extension

Quick steps to isolate work on one app or module.

## Setup
- Install deps once: `pnpm install`
- Use pnpm filters to scope commands (paths are relative to repo root).

## Run dev
- Example (fireux-app): `pnpm --filter ./projects/fireux/fireux-app dev`
- Other apps: replace the filter path (e.g., `./projects/misebox/misebox-app`).

## Lint
- Scoped lint (same command runs guards): `pnpm lint --filter fireux-blogs`
  - Note: guard steps (shape/assets/ts) still run repo-wide; fix listed issues if they surface.

## Typecheck
- Packages: `pnpm typecheck:packages --filter fireux-blogs`
- Apps (Nuxt typecheck): `pnpm typecheck:apps --filter ./projects/fireux/fireux-app`
- All: `pnpm typecheck`

## Tests (if present)
- Use `pnpm test --filter <package>` when tests exist.

## Adding a new module/app
- Prefer generators in `packages/scripts` (`create:app`, `create:module`, `create:ecosystem`) to keep shape guards happy.
- Register new modules via the registry scripts when needed.

## Env
- Keep `.env` and `.env.example` per app; do not rely on another app’s env. Document required vars in `docs/env/<app>.md` (create if missing).

## Detach-ready tips
- Avoid deep relative imports across packages; use public exports/aliases.
- Keep `package.json` metadata (name/version) correct; avoid workspace-only path hacks.
- Ensure lint/typecheck/guards pass before moving code out.
