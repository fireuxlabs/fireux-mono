# Backfill App Memberships

Use this playbook to sync `apps/{appId}/admin_ids` with matching `apps/{appId}/users/{uid}` membership documents. Run it per Firebase project (FireUX, Misebox, Cleanbox) so the UI can read accurate admin roles.

## Prerequisites

- Service account for the Firebase project you are targeting.
- `pnpm install` already run so `esbuild-register` is available.
- Terminal authenticated for `gcloud auth application-default login` if you are relying on ADC instead of a JSON key.

## Script

Path: `automation/migrations/2025-12-backfill-app-memberships.ts`

### Dry run

```sh
FIREBASE_SERVICE_ACCOUNT_FILE=./service-accounts/cleanbox.json \
node -r esbuild-register automation/migrations/2025-12-backfill-app-memberships.ts --dry-run
```

### Apply changes

```sh
FIREBASE_SERVICE_ACCOUNT_FILE=./service-accounts/cleanbox.json \
node -r esbuild-register automation/migrations/2025-12-backfill-app-memberships.ts
```

### Limit scope

- Specific apps: add `--app cleanbox-app --app richies-reinigung`
- Only globals: `--globals-only`
- Only tenants: `--tenants-only`

### Output

- Logs the admins synced per app.
- Writes a summary JSON file to `migrations/backups/backfill-app-memberships-YYYY-MM-DD.json` for auditing.

## Verification

After each project run:

1. In Firestore, confirm `apps/{appId}/users/{uid}` exists with `role: "admin"` for each admin.
2. Check the core `users/{uid}` document now contains `adminOf` + `userOf` arrays referencing the app.
3. Refresh the local dev app (e.g., `/dev/users`) to ensure your account displays as “App Admin”.
