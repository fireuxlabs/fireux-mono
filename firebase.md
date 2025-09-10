# Firebase Configuration Audit (2025-09-10)

Comprehensive snapshot of Firebase setup across all apps/tenants in the monorepo. Includes project bindings, hosting/function configs, gaps, and recommended normalization steps.

## Summary Table

| App / Path                                                | .firebaserc Project   | Hosting Type                                | Functions Deployed | Rewrites Present       | Gaps                                                                         |
| --------------------------------------------------------- | --------------------- | ------------------------------------------- | ------------------ | ---------------------- | ---------------------------------------------------------------------------- |
| fireux-app (`projects/fireux/fireux-app`)                 | fireux-78f9c          | Static (public)                             | No                 | No                     | No SSR rewrites; no functions block                                          |
| tennant (`projects/fireux/tennant`)                       | MISSING (placeholder) | Static (public)                             | No                 | No                     | Missing project id; no SSR rewrites                                          |
| misebox-app (`projects/misebox/misebox-app`)              | misebox-78f9c         | SSR via functions (site + rewrites)         | Yes (server)       | Yes (`** -> function`) | OK                                                                           |
| niederhorn (`projects/misebox/niederhorn`)                | MISSING (placeholder) | Static (public)                             | No                 | No                     | Missing project id; no SSR rewrites                                          |
| cleanbox-app (`projects/cleanbox/cleanbox-app`)           | cleanbox-f15bc        | SSR via functions                           | Yes                | Yes                    | Site id differs (hosting.site = cleanbox) vs project maybe (cleanbox-f15bc?) |
| richies-reinigung (`projects/cleanbox/richies-reinigung`) | cleanbox-f15bc        | SSR via functions (same site id "cleanbox") | Yes                | Yes                    | Shares site id; confirm if intentional                                       |

Notes:

- "Static" entries have only a `hosting.public` folder and no rewrites—suitable only for pure static assets (NOT Nuxt SSR output).
- SSR pattern apps use `.output/server` for Functions and rewrite all routes to the `server` function.

## Detailed Artifacts

### fireux-app

`.firebaserc`

```json
{
  "projects": {
    "default": "fireux-78f9c"
  }
}
```

`firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

Status: Lacks SSR deployment structure. If Nuxt output should be deployed with functions (Node SSR), align with the pattern used in `misebox-app`.

### tennant

`.firebaserc`

```json
{
  "projects": {
    "default": "__REPLACE_WITH_FIREBASE_PROJECT__"
  }
}
```

`firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

Status: Missing real project id. Decide whether this app is deployable or internal only. If deployable, set project and adopt SSR structure if needed.

### misebox-app

`.firebaserc`

```json
{
  "projects": {
    "default": "misebox-78f9c"
  }
}
```

`firebase.json`

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "misebox-78f9c",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

Status: Complete SSR setup (Functions + Hosting + rewrite). Good reference template.

### niederhorn

`.firebaserc`

```json
{
  "projects": {
    "default": "__REPLACE_WITH_FIREBASE_PROJECT__"
  }
}
```

`firebase.json`

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

Status: Missing project id; static-only config. If it should mirror `misebox-app`, replicate SSR structure.

### cleanbox-app

`.firebaserc`

```json
{
  "projects": {
    "default": "cleanbox-f15bc"
  }
}
```

`firebase.json`

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "cleanbox",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

Status: SSR pattern ok. Verify `hosting.site` matches the actual Hosting target (may differ from project id; that is allowed if using multi-site hosting). Confirm if the site id should be `cleanbox-f15bc` for consistency.

### richies-reinigung

`.firebaserc`

```json
{
  "projects": {
    "default": "cleanbox-f15bc"
  }
}
```

`firebase.json`

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "cleanbox",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

Status: Shares the same Hosting site id (`cleanbox`) as `cleanbox-app`. If both need separate deploys, give this app its own hosting site (e.g. `cleanbox-richies`).

## Missing / Inconsistent Elements

- Placeholders: `niederhorn`, `tennant` lack real project IDs.
- Static vs SSR: `fireux-app`, `niederhorn`, `tennant` are static-only; decide if they should be SSR like others.
- Shared hosting site: `cleanbox-app` and `richies-reinigung` point to the same `hosting.site` value.
- No environment `.env` files per app committed (expected; they may be untracked). Ensure each deployment context has required Firebase env vars for Nuxt runtime.

## Recommended Normalization Actions

1. Assign project IDs:
   - Update `niederhorn/.firebaserc` and `tennant/.firebaserc`.
2. Standardize SSR (if desired):
   - For `fireux-app` (and others needing SSR) adopt the SSR `firebase.json` pattern:
     ```json
     {
       "functions": { "source": ".output/server", "runtime": "nodejs22" },
       "hosting": {
         "site": "<project-id-or-custom-site>",
         "public": ".output/public",
         "cleanUrls": true,
         "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
         "rewrites": [{ "source": "**", "function": "server" }]
       }
     }
     ```
3. Unique hosting targets:
   - If `richies-reinigung` needs an independent domain/path, create a distinct Hosting site.
4. Add optional emulators config for local development consistency:
   ```json
   "emulators": {
     "functions": { "port": 5001 },
     "hosting": { "port": 5000 },
     "ui": { "enabled": true }
   }
   ```
5. CI validation script: add a script to assert no `.firebaserc` contains placeholders and SSR apps have rewrites.

## CI Lint Idea (pseudo)

```bash
missing=$(grep -R "__REPLACE_WITH_FIREBASE_PROJECT__" projects || true)
[ -z "$missing" ] || { echo "ERROR: Firebase project placeholders found"; exit 1; }
for f in $(git ls-files 'projects/**/firebase.json'); do
  if jq -e '.functions and .hosting.rewrites[0].function=="server"' "$f" >/dev/null 2>&1; then
    : # SSR ok
  else
    echo "NOTE: $f not using SSR pattern";
  fi
done
```

## Runtime Nuxt Integration Reminder

- `createFireuxConfig()` injects `nuxt-vuefire` with your env-derived Firebase config and the `firebase.client.ts` plugin ensures a single `initializeApp()` per client.
- Ensure each deploy environment exports the required FIREBASE\_\* vars.

## Next Steps

Let me know which fixes to auto-apply:

- [ ] Patch placeholder project IDs
- [ ] Upgrade `fireux-app` to SSR pattern
- [ ] Split hosting site for `richies-reinigung`
- [ ] Add emulator config template to all apps

(Reply with the boxes to check and I will implement.)
