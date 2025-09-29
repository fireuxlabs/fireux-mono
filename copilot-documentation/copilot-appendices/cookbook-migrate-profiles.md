# Cookbook: Migrate Professional Profiles

Purpose: Normalize `professionals` documents to the FireUX profile model. Enforces `id` = doc id, drops legacy `uid`, normalizes timestamps, and renames fields.

Scripts:

- Runner: `scripts/migrateProfiles.cjs` (Node.js, no TS tooling required)
- TypeScript source: `scripts/migrateProfiles.ts`

What it changes

- Renames: `displayName` → `display_name`, `avatarUrl` → `avatar`, `bio_short` → `bioShort`, `bio_long` → `bioLong`
- Identifiers: sets `id` from document id; removes `uid`
- Timestamps: ensures `created_at` is a Firestore `Timestamp`; sets `updated_at` to now

Credentials
Provide Firebase Admin credentials via one of:

- Environment var: `FIREBASE_SERVICE_ACCOUNT` containing the JSON string (make sure `private_key` has real newlines, not `\n`)
- Or file path: `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/serviceAccount.json`
- Or use the Firestore emulator (the script calls `admin.initializeApp()` when `FIREBASE_SERVICE_ACCOUNT` is not set)

Quick run

- Dry run:
  - pnpm migrate:profiles
- Apply changes:
  - pnpm migrate:profiles:apply

CLI flags (pass after the script)

- `--collection=<name>`: collection to migrate (default in scripts is `professionals`)
- `--apply`: actually write changes (omit for dry-run)
- `--limit=<n>`: limit number of docs processed (debug/safety)
- Overlay selection (optional):
  - `--allApps`: also run against `collectionGroup(<collection>)`
  - `--appId=<id>`: also run against `apps/<id>/<collection>`

Examples

- Dry-run first 10:
  - node scripts/migrateProfiles.cjs --collection=professionals --limit=10
- Apply for base collection only:
  - node scripts/migrateProfiles.cjs --collection=professionals --apply
- Apply across all app overlays via collectionGroup:
  - node scripts/migrateProfiles.cjs --collection=professionals --apply --allApps
- Apply for one app overlay:
  - node scripts/migrateProfiles.cjs --collection=professionals --apply --appId=misebox

Notes

- BulkWriter retries up to 5 times per document; errors are logged with document paths.
- The script logs each affected path with a concise note of changes.
- You can re-run safely; operations are idempotent for already-normalized docs.
