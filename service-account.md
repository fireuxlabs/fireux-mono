# Service accounts inventory (4 Sep 2025)

This document captures where Firebase service accounts are referenced or stored across the monorepo. It lists identities and paths only — no secrets. Prefer using FIREBASE_SERVICE_ACCOUNT (JSON string in env) or a local, git-ignored file referenced via GOOGLE_APPLICATION_CREDENTIALS.

> Important: Do not commit private keys. Keep service-account.json files out of version control and store them locally or in secret managers.

## Discovered service account files

- FireUX (project_id: fireux-2005)
  - Path: `projects/fireux/fireux-app/config/service-account.json` (exists)
  - Also present for tenant: `packages/tenants/fireux-fireux/config/service-account.json` (exists)
  - client_email: firebase-adminsdk-fbsvc@fireux-2005.iam.gserviceaccount.com

- MiseBox (project_id: misebox-78f9c)
  - Path: `packages/tenants/fireux-misebox/config/service-account.json` (exists)
  - client_email: firebase-adminsdk-n373e@misebox-78f9c.iam.gserviceaccount.com

- CleanBox (project_id: cleanbox-f15bc)
  - Path: `packages/tenants/fireux-cleanbox/config/service-account.json` (exists)
  - client_email: firebase-adminsdk-fbsvc@cleanbox-f15bc.iam.gserviceaccount.com

## .env references to service accounts

These files set GOOGLE_APPLICATION_CREDENTIALS:

- Root: `.env`
  - GOOGLE_APPLICATION_CREDENTIALS=packages/tenants/fireux-misebox/config/service-account.json

- MiseBox apps
  - `projects/misebox/misebox-app/.env`
    - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-misebox/config/service-account.json
  - `projects/misebox/niederhorn/.env`
    - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-misebox/config/service-account.json

- FireUX app
  - `projects/fireux/fireux-app/.env`
    - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-fireux/config/service-account.json

- CleanBox apps
  - `projects/cleanbox/cleanbox-app/.env`
    - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-cleanbox/config/service-account.json
  - `projects/cleanbox/richies-reinigung/.env`
    - GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-cleanbox/config/service-account.json

> Tip: Instead of a file, you can set FIREBASE_SERVICE_ACCOUNT to the JSON string (single line) in the environment for SSR/Admin code.

## Scripts using service accounts

- `scripts/migrate-core-users.js`
  - fireux -> `projects/fireux/fireux-app/config/service-account.json`
  - misebox -> `packages/tenants/fireux-misebox/config/service-account.json`
  - cleanbox -> `packages/tenants/fireux-cleanbox/config/service-account.json`

## Hygiene and rotation

- Ensure tenant `config/service-account.json` paths are git-ignored (repo includes `**/service-account.json`).
- Prefer storing secrets outside the repo or in your secret manager (e.g., 1Password, Doppler, Vercel/Netlify env vars).
- When rotating, replace the JSON file or update FIREBASE_SERVICE_ACCOUNT and remove old keys in GCP.

---

If you want, I can add a tiny health endpoint/check that verifies the env variable or file path exists at dev start and reports project_id/client_email only.
