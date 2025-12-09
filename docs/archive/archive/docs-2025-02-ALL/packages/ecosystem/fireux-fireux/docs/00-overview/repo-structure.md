# Repository Structure

Purpose: quick map of layers to keep modules detachable.

- `packages/core/*`: shared platform (configs, core runtime, shared utilities). Keep stable APIs; avoid app-local imports.
- `packages/extensions/*`: feature modules (blogs, products, jobs, ecosystem-controller). Depend only on core + their own assets; no app-to-app imports.
- `packages/ecosystem/*`: tenant-specific packages. Should consume core/extensions; avoid depending on `projects/*` apps.
- `projects/*/*`: deployable Nuxt apps (fireux-app, misebox-app, etc.). Wire modules via `nuxt.config` and keep app-local env.
- `tools/*`: supporting tooling (e.g., VS Code toolbar).
- `docs/`: repo docs; use subfolders for topics. Markdown lives here or under `copilot-documentation/` per AGENTS.md.
- `automation/`: guards, maintenance scripts, migrations. Guards enforce shape, tsconfig, and assets.

Notes for detachability

- Use path aliases (`@/` from each package) and avoid deep relative imports across package boundaries.
- Place shared helpers in core or a dedicated shared package; do not import directly from another app/extension.
- Each package/app should own its env (`.env`, `.env.example`) and `package.json` metadata; avoid cross-app env reads.
- Keep guards/lint/typecheck passing to ensure packages stay portable.
