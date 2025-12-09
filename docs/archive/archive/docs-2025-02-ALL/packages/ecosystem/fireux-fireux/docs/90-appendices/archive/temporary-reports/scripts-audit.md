---
title: Scripts Audit Notes
status: draft
created: 2025-10-15
---

# FireUX Scripts Audit (Initial Pass)

## Snapshot

| Script                                                                   | Category                   | Status            | Notes / Suggested Action                                                                                                  |
| ------------------------------------------------------------------------ | -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `scripts/2025-10-ensure-place-professional-links.ts`                     | Data reconciliation        | Keep              | Freshly added for Places <> Professionals consistency; ensure handbook captures run cadence.                              |
| `scripts/2025-10-migrate-apps.ts`                                        | Data canonicalisation      | Keep              | Normalises `apps` collection to canonical core/tenant set; run after service-account rotations.                           |
| `scripts/migrateProfiles.ts` & `scripts/migrateProfiles.cjs`             | Profile migration          | Consolidate       | TS version is richer; update `package.json` to call it, then archive/delete the CJS variant once validated.               |
| `scripts/migrate-chefs.ts`                                               | Legacy chef cleanup        | Review            | Supersedes older chef migrations in most cases; confirm 2025 data model before running again.                             |
| `scripts/migrate-chefs-{bio-casing,canonical,created-at}.ts`             | Legacy chef cleanup        | Archive candidate | One-off runs from pre-handbook era. If no further chef data work is expected, move into `scripts/archive/` with run logs. |
| `scripts/migrate-misebox-app-users.ts` & `scripts/migrate-core-users.js` | App/core user sync         | Review            | Rely on hard-coded service-account paths; evaluate whether newer profile migration covers these flows.                    |
| `scripts/fix-display-names.ts`                                           | Name sanitiser             | Keep (rare)       | Useful if email-style display names reappear; document safe run procedure.                                                |
| `scripts/backfill-core-avatars.ts`                                       | Avatar backfill            | Keep (rare)       | Heavy but still relevant if avatars missing; requires fetch + Storage permissions.                                        |
| `scripts/migrate-professionals-experience.ts`                            | Professionals data rewrite | Keep              | Aligns with current professionals model; runbook needed.                                                                  |
| `scripts/hotfix-reka-ui.mjs`                                             | Vendor hotfix              | Archive candidate | Patch for `reka-ui@2.5.0`; confirm dependency bumped or issue resolved before removal.                                    |
| `scripts/cleanup-phantom-files.sh` & `scripts/phantom-cleanup.sh`        | Repo hygiene               | Merge             | Two overlapping phantom-cleanup routines; keep a single non-interactive version and link from handbook.                   |
| `scripts/structure-maintenance.sh`                                       | Repo guard                 | Archive candidate | Largely replaced by `tools/guard-*.mjs`; consider folding remaining checks into guard scripts.                            |
| `scripts/create-tenant.js`                                               | Tenant scaffolding         | Keep              | Still the primary guided flow; ensure instructions live under `copilot-instructions/`.                                    |
| `scripts/update-images-md.mjs`                                           | Doc automation             | Keep              | Supports `images.md` report regeneration.                                                                                 |
| `scripts/check-env.mjs`                                                  | Env lint                   | Keep              | Part of guard/CI routine.                                                                                                 |
| `scripts/gitsave.sh`                                                     | Git helper                 | Keep              | Developer convenience; no cleanup required.                                                                               |

## Recommended Next Steps

1. Confirm which chef migrations remain relevant; archive or delete the redundant trio once backward-compatibility is assured.
2. Flip the profile migration scripts over to the TypeScript version (`pnpm tsx scripts/migrateProfiles.ts ...`) and remove the CJS fallback.
3. Deduplicate the phantom cleanup utilities and document the single supported workflow in the handbook.
4. Review `migrate-core-users.js` and `migrate-misebox-app-users.ts` versus the new profile migration; either fold scenarios into the modern script or move the legacy ones under `scripts/archive/`.
5. Decide whether vendor hotfixes like `hotfix-reka-ui.mjs` should live in a `vendor-patches/` folder or be pruned now that dependencies are upgraded.
6. Add a short index under `copilot-instructions/` describing how to run active migration scripts (inputs, dry-run flags, safety checks).
