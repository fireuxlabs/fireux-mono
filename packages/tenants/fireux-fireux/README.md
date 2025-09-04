# fireux-fireux (tenant)

This tenant package holds FireUX app–specific assets and configuration.

## Service account

Place your Firebase Admin service account JSON at:

```
packages/tenants/fireux-fireux/config/service-account.json
```

Security:

- The file is git-ignored locally (see .gitignore in this package).
- Do not commit real credentials.

## Usage

In `projects/fireux/fireux-app/.env` set:

```
GOOGLE_APPLICATION_CREDENTIALS=../../../packages/tenants/fireux-fireux/config/service-account.json
```

Then restart the dev server.
