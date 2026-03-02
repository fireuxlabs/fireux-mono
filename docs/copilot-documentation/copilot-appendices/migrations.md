# FireUX migrations (agent runbook)
Authority: Tier2 (Operational)
Updated: 2026-03-02

Purpose: Provide a repeatable workflow for migrating Firestore data when runtime models change (drift reconciliation).

## When to migrate

- A runtime model in packages/core or extensions changes shape.
- Dev drift toolbar shows missing/extra fields that should be reconciled into the model.
- We prefer migration over legacy compatibility.

## Inputs

- Dev page URL (e.g. http://localhost:3001/dev/apps) to determine collection + context.
- Drift JSON (copy from Dev drift toolbar).
- Target model file (e.g. packages/core/fireux-core/src/runtime/models/core/app.model.ts).
- Ecosystem Firebase config path:
  - packages/ecosystem/fireux-<ecosystem>/src/config/firebase

## How to identify the collection + ecosystem

1. Use the dev page URL:
   - /dev/apps → apps collection (core)
   - /dev/users → users collection (core)
   - /dev/fireux-places → places collection (extension)
   - /dev/fireux-kitchens → kitchens collection (extension)
   - /dev/fireux-companies → companies collection (extension)
   - /dev/fireux-jobs → jobs + agents + professionals (extension)
   - /dev/fireux-misebox → misebox-specific collections (ecosystem)
2. Use the drift payload entries:
   - Each item shows id + ecosystem (e.g. misebox-app in misebox).
3. Resolve Firebase auth config from ecosystem:
   - packages/ecosystem/fireux-<ecosystem>/src/config/firebase

## Migration strategy (canonical)

- The target runtime model is the source of truth.
- Migrate data to match the model.
- Remove deprecated/legacy fields once migrated.
- Use safe defaults for required fields:
  - strings: ''
  - arrays: []
  - numbers: 0
  - nested objects: {} with required keys

## Workflow

1. Read drift payload and list required changes:
   - missing fields → backfill with defaults or transform existing data.
   - extra fields → move/rename into correct shape or delete.
2. Inspect the target model to confirm canonical shape and defaults.
3. Implement a migration script under scripts/:
   - Name: migrate-<domain>-<change>.mjs
   - Default to dry-run; only write on --commit.
   - Support --project and optional --app / --limit / --pageSize.
4. Use Firebase Admin SDK with ADC or service account env.
5. Run against the correct ecosystem project.
6. Verify in dev page (drift should clear).
7. Document any follow-up data fixes if needed.

## Example: App media nesting drift

Drift shows:
- missing: media.thumbnail_url, media.logo_url, media.wordmark_light_url, media.wordmark_dark_url
- extra: thumbnail_url, logo_url, wordmark_*_url

Migration:
- Move legacy flat media fields into media.*
- Delete legacy fields
- Backfill required app fields:
  - app_short_name, tagline, short_bio, long_bio → ''
  - join_requests → []
  - user_count → 0

## Notes

- If multiple collections exist in one page (e.g. misebox, jobs), treat each section independently.
- Prefer minimal writes: only update docs that need changes.
- Use batch writes with a safe size (<= 400 ops per batch).
