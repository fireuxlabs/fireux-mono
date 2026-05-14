# Firebase Web App Config Audit
Authority: Tier3 (Operational Report)
Updated: 2026-05-14

## Purpose

Track the app-by-app Firebase web app configuration audit across every FireUX ecosystem.

This exists because Firebase web apps inside the same Firebase project can use different API keys. The ecosystem default is useful, but it is not enough proof for deployment.

## Canon Summary

- Ecosystem config owns shared Firebase project values:
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - default Firestore `databaseId`
  - ecosystem default `apiKey`
- App config/env owns app web identity:
  - `APP_DOMAIN`
  - `NUXT_FIREBASE_APP_ID`
  - `NUXT_FIREBASE_MEASUREMENT_ID`
  - app `databaseId`
- App config/env may also own:
  - `NUXT_FIREBASE_API_KEY`
- Runtime `apiKey` resolution is:
  - app-level `NUXT_FIREBASE_API_KEY`
  - ecosystem default `apiKey`
- Missing app-level `NUXT_FIREBASE_API_KEY` is acceptable only when the app's Firebase console web app snippet uses the ecosystem default key.

## Known FireUX Firebase Web App Snippets

All rows below are for Firebase project `fireux-2005`.

| App | Status | API Key | Firebase App ID | Measurement ID |
|---|---|---|---|---|
| `fireux-app` | confirmed | `AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4` | `1:549102750204:web:0556da9447a9ca8db8ca79` | `G-YWPE3GRRQ5` |
| `fireux-tenant` | confirmed | `AIzaSyBXQzbWwcOCMyBEVn1plDVJAofmalenLM4` | `1:549102750204:web:f136fca73d3c9101b8ca79` | `G-4R6XV8JJEP` |
| `sproochli` | confirmed | `AIzaSyC5sIbOe5SU6t4g6LTmoKZi6dvzN33nRFg` | `1:549102750204:web:655eae68fa4093deb8ca79` | `G-SV7Y1KYTBH` |
| `buenohost` | confirmed | `AIzaSyC5sIbOe5SU6t4g6LTmoKZi6dvzN33nRFg` | `1:549102750204:web:31897caa206ef248b8ca79` | `G-CJZPXTKG0K` |

## Apps To Audit

For each app:

1. Open the Firebase console web app settings.
2. Copy the app's `firebaseConfig` snippet.
3. Confirm `apiKey`, `appId`, and `measurementId`.
4. Put app-specific values in app env/deploy config.
5. Keep shared project values in ecosystem config.
6. Confirm the app's registry `databaseId`.
7. Run `nuxi prepare`.
8. Load the app locally and confirm it initializes.
9. Confirm production deploy env/secrets match local env.

| Key | App ID | Ecosystem | Database | Path | Port | Audit Status |
|---|---|---|---|---|---:|---|
| `fireux` | `fireux-app` | `fireux` | `fireux` | `./projects/fireux/fireux-app` | 3000 | confirmed |
| `misebox` | `misebox-app` | `misebox` | `misebox` | `./projects/misebox/misebox-app` | 3001 | todo |
| `cleanbox` | `cleanbox-app` | `cleanbox` | `cleanbox` | `./projects/cleanbox/cleanbox-app` | 3002 | todo |
| `niederhorn` | `niederhorn` | `misebox` | `misebox` | `./projects/misebox/niederhorn` | 3003 | todo |
| `richies` | `richies-reinigung` | `cleanbox` | `cleanbox` | `./projects/cleanbox/richies-reinigung` | 3004 | todo |
| `tenant` | `fireux-tenant` | `fireux` | `fireux` | `./projects/fireux/tenant` | 3005 | confirmed |
| `bringli` | `bringli-app` | `bringli` | `bringli` | `./projects/bringli/bringli-app` | 3006 | todo |
| `find-my-seo` | `find-my-seo-app` | `fireux` | `fireux` | `./projects/fireux/find-my-seo-app` | 3010 | todo |
| `sproochli` | `sproochli` | `fireux` | `sproochli` | `./projects/fireux/sproochli` | 3011 | confirmed |
| `buenohost` | `buenohost` | `fireux` | `buenohost` | `./projects/fireux/buenohost` | 3012 | confirmed |
| `granite` | `granite-app` | `granite` | `granite` | `./projects/granite/granite-app` | 3007 | todo |
| `la-tap-berne` | `la-tap-berne` | `misebox` | `misebox` | `./projects/misebox/la-tap-berne` | 3008 | todo |

## Deploy Environment Checklist

Local ignored `.env` files are not enough. For each deploy target, make sure the hosting/function environment has:

```text
APP_DOMAIN
NUXT_FIREBASE_API_KEY
NUXT_FIREBASE_APP_ID
NUXT_FIREBASE_MEASUREMENT_ID
```

If an app intentionally uses the ecosystem default API key, document that decision in this report and omit only `NUXT_FIREBASE_API_KEY`.

## Current Todo

- Audit Firebase web config for every `todo` app above.
- Confirm production deploy env for `sproochli` and `buenohost`.
- Confirm each standalone app has its named Firestore database.
- Confirm each app has app media in both local `public/img/app` and Firebase Storage.
- Keep `docs/guide/new-app.creation.md` aligned when the app creation workflow changes.
