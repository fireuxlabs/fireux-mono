# Migration guide
Authority: Tier2 (Operational)
Updated: 2026-03-02

Purpose: quick reference for one-off migrations and scripts in FireUX-Mono.

## Firebase config locations

Misebox ecosystem Firebase config:

- packages/ecosystem/fireux-misebox/src/config/firebase/
- packages/ecosystem/fireux-misebox/src/config/firebase/ecosystem.config.ts
- packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json

## Auth options for migration scripts

Use ONE of:

- GOOGLE_APPLICATION_CREDENTIALS
  - Path to a Firebase service account JSON file.
- FIREBASE_SERVICE_ACCOUNT
  - The JSON string of a Firebase service account.
- Google ADC
  - Run `gcloud auth application-default login` (local dev only).

Common project envs:

- FIREBASE_PROJECT_ID or GCLOUD_PROJECT
- FIREBASE_STORAGE_BUCKET (if needed)

## Running migrations

Most scripts live under:

- scripts/

Typical pattern:

- Dry run first (no `--commit`)
- Then run with `--commit`

## Example scripts

### Migrate place images from avatar to image

- scripts/migrate-place-avatars-to-image.ts

Run:

- pnpm -s tsx scripts/migrate-place-avatars-to-image.ts --project <projectId>
- pnpm -s tsx scripts/migrate-place-avatars-to-image.ts --project <projectId> --commit

Optional:

- --bucket <bucketName>

### Backfill creator_id for Places

- scripts/migrate-place-creator-id.ts

Run:

- pnpm -s tsx scripts/migrate-place-creator-id.ts --project <projectId> --creator <uid>
- pnpm -s tsx scripts/migrate-place-creator-id.ts --project <projectId> --creator <uid> --commit

Optional:

- --pageSize <N>
