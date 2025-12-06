# Create & Register System

A shared creation + registration workflow keeps every FireUX asset (apps, modules, ecosystems) consistent, observable, and auditable. This note captures the desired outcomes plus an initial plan for scaffolding, metadata, and storage inside the `fireux-fireux` Firestore database.

## Goals

- One command to scaffold a new **app**, **module**, or **ecosystem** with repo templates, CI hooks, and runtime wiring.
- Automatic registration that writes a canonical record in Firestore immediately after creation (or when promoted from draft → active).
- Consistent metadata schemas so tooling, dashboards, and guards can reason about every asset without local heuristics.
- Guardrails that prevent deploying unregistered assets and that surface drift (e.g., deleted repo folder but orphaned registry entry).

## Registry terminology

We intentionally use the word “registry” for two layers of the workflow:

1. **Local registry file** — A `registry.json` (kept next to the asset folder) that contains the full metadata payload. This file is versioned with the codebase and acts as the single source of truth for reviews.
2. **Remote registry database** — The `fireux-fireux` Firestore project, specifically the `<entityType>/<id>` collections (`modules/fireux-core`, `apps/fireux-app`, etc.), where the CLI publishes the same metadata so runtime tooling, dashboards, and guards can read it centrally.

The `pnpm registry:*` commands always read from the local file first and then sync to the remote database so the repo history and the database never drift silently.

## Entities & Metadata

Each entity type shares a core envelope plus type-specific payloads. Store all records in Firestore directly under `<entityType>/<id>` so consumers can query by type or aggregate everything (e.g., `modules/fireux-core`).

| Field              | Description                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `id`               | Slug (kebab-case) derived from folder name (`fireux-app`, `fireux-core`, `places-extension`, etc.). |
| `type`             | One of `app`, `module`, `ecosystem`.                                                                |
| `status`           | `draft`, `active`, `deprecated`, `archived`. Guards enforce `active` before prod deploys.           |
| `createdAt` / `by` | ISO timestamp + user identifier (GitHub handle, SSO ID).                                            |
| `updatedAt` / `by` | Managed automatically whenever metadata changes.                                                    |
| `sourcePath`       | Monorepo path (`projects/fireux`, `packages/core/fireux-core`, etc.).                               |
| `runtimeConfig`    | Minimal runtime hints (Nuxt module name, needs Firebase, needs Stripe, etc.).                       |
| `deployTargets`    | Array of environments or tenants this asset ships to.                                               |
| `notes`            | Optional text for ADR linkage, feature flags, or pending migrations.                                |

Type-specific additions:

- **App**: default domain, tenant id, enabled modules, storage bucket, analytics ids.
- **Module**: Nuxt module entrypoint, auto-registered server handlers, compatible app versions, peer deps.
- **Ecosystem**: list of packaged modules/apps, branding bundle, secrets profile, release cadence.

## Creation Workflow

1. `pnpm create:asset` (umbrella CLI) will prompt for asset type, slug, human name, and optional template. For modules we already expose `pnpm create:module <slug>` which scaffolds `packages/extensions/<slug>` plus `registry.json`.
2. CLI scaffolds files:
   - Apps → `projects/<slug>/` with Nuxt + runtime configs.
   - Modules → `packages/<scope>/<slug>/` with module entry + runtime server/auto-import setup.
   - Ecosystems → `packages/ecosystem/<slug>/` or `projects/<ecosystem>/<slug>/` depending on structure.
3. CLI emits a `registry.json` draft file alongside the scaffold for review and commits it with the new asset.
4. On success, CLI calls `pnpm registry:register --from registry.json` to push to Firestore (requires service creds or uses existing Firebase Admin helpers).
5. CI guard verifies that any new asset folder has a matching Firestore record before merge.

## Registration Flow

- **Command**: `pnpm registry:register <path>` reads the local metadata file, validates required fields, and writes to Firestore (currently `<type>/<id>` using service-account creds or the registry endpoint).
- **Environment**: ensure either `FIREBASE_SERVICE_ACCOUNT` (JSON string) or `GOOGLE_APPLICATION_CREDENTIALS` (path) is set before running the command; the CLI reuses the same Firebase Admin bootstrap logic as server handlers.
- **Idempotency**: writes are upserts; the tool tracks `registryVersion` to detect schema drift.
- **Security**: use service account scoped to the registry collection; avoid broad admin keys on developer machines (invoke via existing admin helper + impersonation or a Cloud Function callable).
- **Audit**: store last git commit hash + repo URL for traceability.
- **Notifications**: optional webhook or Slack post summarizing the new/updated asset.

## Drift Detection & Maintenance

- Nightly job compares repo folders vs registry entries; missing/inactive entries raise alerts in the `guard` scripts.
- `pnpm registry:list` fetches and prints summaries so developers can confirm status locally.
- `pnpm registry:sync` rewrites Firestore entries based on local `registry.json` files (useful after bulk edits).

## Next Steps

1. Define Zod schemas per entity (shareable via `packages/types`).
2. Scaffold CLI commands under `packages/scripts` leveraging existing guard infrastructure.
3. Add CI guard (probably in `automation/guards`) that blocks PRs adding asset folders without registry updates.
4. Backfill existing apps/modules/ecosystems by generating `registry.json` files and running `registry:register`.
5. Document the workflow in `copilot-documentation` and link from `server.md` once the API is stable.
