# FireUX Automation Migrations

Even though the previous migrations were retired, this folder documents how to run future one-off scripts safely. Stick to these steps when you need to recreate a migration.

## 1. Service account setup

- Create a Firebase service account key (IAM & Admin → Service Accounts → Generate new private key) with permissions to read/write Firestore.
- Store the JSON in a secure location. For local runs, save it as `~/.fireux/service-account.json` or any path outside the repo.
- Export one of the following before running scripts:
  - `export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat ~/.fireux/service-account.json)"`
  - or `export FIREBASE_SERVICE_ACCOUNT_FILE=~/.fireux/service-account.json`
  - or run `gcloud auth application-default login` to use ADC.

## 2. Running a script

```bash
cd automation/migrations
node <script-name>.ts --flag=value
```

- Prefer `--dry-run` flags when they exist. Confirm output before running without it.
- Filter scope (tenants vs globals) with the script’s provided flags; never run across all tenants unless necessary.

## 3. Logging & rollbacks

- Scripts must log every app/user they touch and the “previous” vs “next” values.
- Keep a copy of the Firestore documents (or export) before running a destructive change.
- After a migration, archive the script output in `artifacts/migrations/<date>.log` for audit.

## 4. Clean-up

- Once a migration finishes, remove or archive the script so it doesn’t run accidentally in future guards/deploys.
- Update this README if you add new environment requirements or conventions.
