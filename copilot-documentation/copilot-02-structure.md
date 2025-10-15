title: Monorepo Structure
status: active
updated: 2025-10-15

---

[← Back to ToC](./copilot-00-toc.md)

# Monorepo Structure

## Ownership quick map

- `packages/core/*` — shared modules (e.g. `fireux-core`).
- `packages/extensions/*` — feature slices layered over core (e.g. `fireux-jobs`, `fireux-places`).
- `packages/tenants/*` — tenant modules that bundle extensions for an ecosystem (e.g. `fireux-misebox`).
- `projects/<ecosystem>/<app>` — Nuxt apps that ship to users; each consumes tenant modules through `createFireuxConfig`.
- `copilot-documentation/` — canonical handbook; per-package details live beside code under `packages/**/docs/` or `projects/**/docs/`.

## Install graph (verified 2025-10-15)

- Apps load modules exclusively via `createFireuxConfig` (see `projects/misebox/misebox-app/nuxt.config.ts`).
- Tenants never install `fireux-core`; they install the extensions they own. Example: `packages/tenants/fireux-misebox/src/module.ts` installs `fireux-jobs` and `fireux-places` while relying on the app for core.
- Extensions install `fireux-core` themselves (`packages/extensions/fireux-jobs/src/module.ts`, `packages/extensions/fireux-places/src/module.ts`). This keeps their runtime assets available regardless of which tenant consumes them.
- Deduping happens inside `createFireuxConfig`, but policy still matters: avoid listing the same module in both app and tenant.

## Import rules

- Packages export from `src/` via `package.json#exports`. Use `import { ... } from 'fireux-core/runtime/...';` — never reach into another package’s `src/` or `dist/` path.
- Nuxt apps inherit module-alias settings from `projects/**/tsconfig.json`. These map `fireux-*/` to the relevant `packages/**/src`, and surface Nuxt virtual aliases (`#imports`, `#build`, `#pwa`). Leave Nuxt defaults (`~`, `@`, `~~`) untouched.
- Runtime-only helpers live under `packages/core/fireux-core/src/runtime`. When you need types or composables, import from `fireux-core/runtime/...` rather than using the legacy `#fireux-core-runtime` alias (kept only for compatibility).

## Routing ownership

- Routes belong to the package that ships them. Inspect `packages/extensions/fireux-jobs/src/config/pages-config.ts` or `packages/extensions/fireux-places/src/config/pages-config.ts` to see how extensions expose pages.
- Tenants aggregate routes by installing extensions and wiring tenant-specific pages in their own `config/pages-config.ts`.
- Apps contribute only app-shell routes (e.g. marketing or auth) inside `projects/**/app/pages`. Avoid shadowing extension routes in the app layer; choose a single owner per path.

## Docs location

- Canonical handbook: `copilot-documentation/` (this file, config, CI/CD, appendices, ADRs).
- Package- or tenant-specific notes belong under `packages/**/docs/` (create on demand). For example, places search docs now live in `packages/extensions/fireux-places/docs/`.
- Keep the repo root Markdown to `README.md` and `AGENTS.md`.

---

### Next

- Configure Nuxt and TypeScript in [Config (Nuxt / TS / Env)](./copilot-03-config.md)
