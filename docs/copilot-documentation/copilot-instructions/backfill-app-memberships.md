---
title: Backfill App Memberships
status: working
updated: 2026-01-11
---

# Backfill App Memberships

This playbook describes the intended backfill flow to sync `apps/{appId}/admin_ids` with matching `apps/{appId}/users/{uid}` membership documents.

Important: the referenced migration script has not been implemented in this repo yet (there is no `automation/` folder). Treat this document as a spec/placeholder until the script exists.

## Prerequisites

- Service account for the Firebase project you are targeting.
- `pnpm install` already run so `esbuild-register` is available.
- Terminal authenticated for `gcloud auth application-default login` if you are relying on ADC instead of a JSON key.

## Script (TODO)

Implement a migration script under `scripts/` (recommended location: `scripts/migrations/`) and add a `pnpm` entrypoint for it.

### Limit scope

- Specific apps: add `--app cleanbox-app --app richies-reinigung`
- Only globals: `--globals-only`
- Only tenants: `--tenants-only`

### Output

- Logs the admins synced per app.
- Write a summary JSON file (location to be decided; keep it outside `packages/**/dist`).

## Verification

After each project run:

1. In Firestore, confirm `apps/{appId}/users/{uid}` exists with `role: "admin"` for each admin.
2. Check the core `users/{uid}` document now contains `adminOf` + `userOf` arrays referencing the app.
3. Refresh the local dev app (e.g., `/dev/users`) to ensure your account displays as “App Admin”.
