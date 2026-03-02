<!--
source: ecosystem-change.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# Ecosystem Folder Rename — Before/After Snapshot
Authority: Tier3 (Tooling/history)
Updated: 2026-03-02

## Context

- Change requested: rename the shared tenant package namespace from `packages/ecosystem/` to `packages/ecosystem/` to better reflect the platform → ecosystem → tenant hierarchy.
- Scope executed: physical directory rename plus first-wave config updates so tooling keeps resolving the packages.

---

## Structure Comparison

| Layer         | Before                                                                                                                                                          | After                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Packages root | `packages/`<br>├─ `core/`<br>├─ `extensions/`<br>├─ `tenants/`<br>│ ├─ `fireux-misebox/`<br>│ ├─ `fireux-cleanbox/`<br>│ ├─ `fireux-fireux/`<br>│ └─ `scripts/` | `packages/`<br>├─ `core/`<br>├─ `extensions/`<br>├─ `ecosystem/`<br>│ ├─ `fireux-misebox/`<br>│ ├─ `fireux-cleanbox/`<br>│ ├─ `fireux-fireux/`<br>│ └─ `scripts/` |

---

## Path Inventory — Packages

| Layer                 | Paths                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Platform core         | `packages/core/fireux-core`                                                                                       |
| Ecosystem packages    | `packages/ecosystem/fireux-misebox`<br>`packages/ecosystem/fireux-cleanbox`<br>`packages/ecosystem/fireux-fireux` |
| Ecosystem tooling     | `packages/ecosystem/scripts`                                                                                      |
| Ecosystem configs     | `packages/ecosystem/tsconfig.json`                                                                                |
| Extension packages    | `packages/extensions/fireux-jobs`<br>`packages/extensions/fireux-places`<br>`packages/extensions/tsconfig.json`   |
| Package-level tooling | `packages/scripts`<br>`packages/tsconfig.json`<br>`packages/tsconfig.packages.tsbuildinfo`                        |

---

## Path Inventory — Projects

| Ecosystem             | Apps / tenants                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FireUX                | `projects/fireux/fireux-app` (platform marketing)<br>`projects/fireux/tennant` (reference tenant shell)<br>`projects/fireux/tsconfig.app.base.json`                 |
| Misebox               | `projects/misebox/misebox-app` (primary Misebox app)<br>`projects/misebox/niederhorn` (tenant on Misebox)<br>`projects/misebox/tsconfig.app.base.json`              |
| Cleanbox              | `projects/cleanbox/cleanbox-app` (primary Cleanbox app)<br>`projects/cleanbox/richies-reinigung` (tenant on Cleanbox)<br>`projects/cleanbox/tsconfig.app.base.json` |
| Global project config | `projects/tsconfig.json`<br>`projects/tsconfig.projects.json`                                                                                                       |

---

## Shared Asset Targets (Post-Rename Plan)

| Brand layer                         | Recommended shared path                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Platform (FireUX)                   | `packages/core/fireux-core/src/runtime/public/img/core/brand/*`         |
| Ecosystem (Misebox)                 | `packages/ecosystem/fireux-misebox/src/runtime/public/img/ecosystem/*`  |
| Ecosystem (Cleanbox)                | `packages/ecosystem/fireux-cleanbox/src/runtime/public/img/ecosystem/*` |
| Individual tenant (e.g. Niederhorn) | `projects/misebox/niederhorn/public/img/app/*`                          |

---

## Config Touchpoints Updated

| File                              | Purpose of change                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm-workspace.yaml`             | Updated workspace glob from `packages/ecosystem/*` → `packages/ecosystem/*` so pnpm discovers ecosystem packages.    |
| `package.json` (workspaces array) | Same glob update for npm-style tooling.                                                                              |
| `tsconfig.base.json`              | Redirected path aliases (`fireux-misebox`, `@fireux-misebox/*`, etc.) to the new `packages/ecosystem/...` locations. |
| `.gitignore`                      | Adjusted ignore patterns to track generated d.ts/index files under the new folder.                                   |

---

## Follow-Up Tasks

- Update remaining references to `packages/ecosystem/…` across automation scripts, docs, and guards (grep count was >20). These mostly appear in:
  - Repo scripts (`scripts/`), including migrations and guards.
  - Dev tooling UIs under `packages/core/fireux-core/src/runtime/...`.
  - Documentation (`config-report.md`, project docs).
- After references are updated, rerun guard scripts (`pnpm guard:apps:shape`) to confirm the rename cascades cleanly.
- Shared ecosystem assets live under `packages/ecosystem/*/src/runtime/public/img/ecosystem/`; use each app’s `/dev/images` (or `/dev/img`) route to sanity-check previews before deploying.

---

## Notes

- No package names or import specifiers changed; only the file-system root moved. Existing imports like `import module from 'fireux-misebox'` continue to work because the TS path aliases were updated.
- Ensure any CI/CD or deployment scripts that reference `packages/ecosystem/` are updated before the next release cut.
- Extension packages remain under `packages/extensions/*` (for example `packages/extensions/fireux-jobs`), so no changes are required for that layer.
