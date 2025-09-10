# Dev Environment Source of Truth

Single canonical reference for configuring local development across all FireUX ecosystem apps.

## 1. Core Principle
All apps derive Firebase + app settings from environment variables loaded before `createFireuxConfig()` executes. Avoid duplicating docs per app; update this file only.

## 2. Variable Inventory
| Variable | Required | Scope | Purpose | Consumed By |
|----------|----------|-------|---------|-------------|
| FIREBASE_API_KEY | Yes | Client | Firebase Web SDK config | vuefire / firebase.client.ts |
| FIREBASE_AUTH_DOMAIN | Yes | Client | Auth domain | vuefire |
| FIREBASE_PROJECT_ID | Yes | Both | Project identifier | vuefire / service account |
| FIREBASE_STORAGE_BUCKET | Yes | Client | Storage bucket | vuefire |
| FIREBASE_MESSAGING_SENDER_ID | Yes | Client | Messaging sender ID | vuefire (FMS optional) |
| FIREBASE_APP_ID | Yes | Client | Firebase App instance ID | vuefire |
| FIREBASE_MEASUREMENT_ID | No | Client | Analytics measurement | vuefire (analytics) |
| FIREBASE_RECAPTCHA_V3_KEY | No | Client | App Check key (ReCaptcha V3) | vuefire appCheck |
| FIREBASE_SERVICE_ACCOUNT | No | Server | Inline JSON creds (alternative to file path) | Admin/ scripts |
| GOOGLE_APPLICATION_CREDENTIALS | No | Server | Path to service account JSON file | Admin SDK |
| APP_ID | Yes | Both | Unique app identifier | createFireuxConfig → runtimeConfig.public.appSettings |
| ECOSYSTEM | Yes | Both | Ecosystem grouping (fireux|misebox|cleanbox|...) | runtimeConfig.public.ecosystem |
| APP_NAME | Yes | Client | Full display name | head.title / PWA manifest |
| APP_SHORT_NAME | Yes | Client | Short manifest name | PWA manifest |
| APP_PRIMARY_COLOR | Yes | Client | Theme / PWA color | runtimeConfig.public.primaryColor |
| APP_NEUTRAL_COLOR | No | Client | Secondary neutral palette | runtimeConfig.public.neutralColor |
| APP_ICON | No | Client | UI icon key | UI components |
| APP_DOMAIN | No | Both | Production domain | custom logic / links |
| DOMAIN | No | Both | Local base URL (dev) | optional usage |
| PROJECT_NAME | No | Both | Internal label | docs / meta |
| AUTHOR_NAME | No | Client | Attribution | UI/meta |
| PIN | No | Dev | Lightweight dev gating/seed | custom logic |
| OPENAI_API_KEY_NAME | No | Server | Key indirection | server feature |
| OPENAI_API_KEY | No | Server | OpenAI access | server feature |
| STRIPE_PUBLISHABLE_KEY | No | Client | Stripe public key | payment UI |
| STRIPE_SECRET_KEY | No | Server | Stripe secret | backend calls |
| STRIPE_WEBHOOK_SECRET | No | Server | Webhook signature verify | webhook handler |
| DEVELOPER_ID | No | Both | Feature flag / dev access | useFireUXConfig |
| DEV_MODE | No | Both | Enables dev-only UI pieces | conditional UI |

## 3. Runtime Mapping
`createFireuxConfig()` injects into `runtimeConfig.public`:
- `firebaseConfig` → object built from FIREBASE_* keys
- `ecosystem`, `appName`, `appShortName`, `primaryColor`, `neutralColor`
- `appSettings.appId`, `appSettings.ecosystem`

The Firebase client plugin (`firebase.client.ts`) runs once per client, using that `firebaseConfig`.

## 4. File Templates
### .env.example (authoritative)
Kept in repo root. Copy it to a real `.env` (ignored) or export variables via shell / CI.

### Per-App Override
If different apps map to different Firebase projects, create a `.env` in each app directory (still ignored) overriding only the differing FIREBASE_* + APP_ID + ECOSYSTEM.

## 5. SSR vs Static Deploy (Firebase Hosting)
Apps needing SSR should use a `firebase.json` with:
```json
{
  "functions": { "source": ".output/server", "runtime": "nodejs22" },
  "hosting": {
    "site": "<hosting-site>",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```
Static-only variants can omit the `functions` + `rewrites` and just host `public`.

## 6. Validation Script (Optional)
Add as `scripts/check-env.mjs` or CI step:
```bash
missing=$(grep -R "__REPLACE_WITH_FIREBASE_PROJECT__" projects || true)
[ -z "$missing" ] || { echo "ERROR: Placeholder Firebase project ids found"; exit 1; }
required=(FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_PROJECT_ID FIREBASE_STORAGE_BUCKET FIREBASE_MESSAGING_SENDER_ID FIREBASE_APP_ID APP_ID ECOSYSTEM APP_NAME APP_SHORT_NAME APP_PRIMARY_COLOR)
for v in "${required[@]}"; do
  if [ -z "${!v}" ]; then echo "MISSING $v"; fi
done
```

## 7. Adding a New App (Checklist)
1. Duplicate an existing app folder structure.
2. Create its project in Firebase Console.
3. Add web app; capture config → set FIREBASE_* keys.
4. Set `APP_ID`, `ECOSYSTEM`, branding vars.
5. Decide SSR vs static; craft `firebase.json` accordingly.
6. Update `.firebaserc` with the new project id (or hosting site id).
7. Run `pnpm dev:<app>` to confirm initialization.

## 8. Common Pitfalls
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Auth composables undefined | Missing FIREBASE_* vars at runtime | Export vars before dev server start |
| Duplicate Firebase app warning | Multiple manual initialize attempts | Keep only core plugin; remove ad-hoc inits |
| 404 on deep links in SSR app | Missing rewrites block | Add `rewrites` to firebase.json |
| AppCheck errors | Missing FIREBASE_RECAPTCHA_V3_KEY | Add key or disable appCheck override |

## 9. When Updating This File
- Keep the table alphabetical by main category groups.
- Reflect any new env usage immediately to prevent drift.

## 10. Single Source of Truth
Treat this file + `.env.example` as the only authoritative definitions. Delete stray env docs elsewhere when encountered.

---
Revision: 2025-09-10
