title: Config (Nuxt / TypeScript / Env)
status: active
updated: 2025-10-15

---

[← Back to ToC](./copilot-00-toc.md)

# Config (Nuxt / TypeScript / Env)

## Nuxt apps (example: Misebox global app)

```ts
// projects/misebox/misebox-app/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(
  createFireuxConfig({
    appName: 'Misebox',
    appShortName: 'Misebox',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'global',
  })
)
```

`createFireuxConfig` lives in `packages/core/fireux-core/src/config/fireux/fireux-config.ts` and acts as the single entry point for app configuration. It:

- Adds Nuxt UI, Nuxt Icon, VueFire, and PWA modules automatically.
- Deduplicates additional modules you pass in (`modules` option) so tenants/extensions can safely re-install dependencies.
- Reads Firebase, PWA, and color theming from environment variables (`APP_*`, `FIREBASE_*`, `GOOGLE_PLACES_API_KEY`).
- Mirrors ecosystem metadata to `runtimeConfig.public` so composables can introspect the app.
- Restricts Vite `server.fs.allow` to the workspace root during dev for security.

When an app must skip core (rare legacy cases), pass `includeCore: false` — otherwise leave it alone and let the helper install `fireux-core`.

## TypeScript setup

- Root `tsconfig.json` sets `module` to `ESNext`, `moduleResolution` to `Bundler`, and declares package path aliases.
- App configs extend the shared base; example below aligns with `projects/misebox/misebox-app/tsconfig.json`:

```jsonc
{
  "extends": "../tsconfig.app.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "fireux-fireux/*": ["../../../packages/tenants/fireux-fireux/src/*"],
      "fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "#fireux-core-runtime/*": [
        "../../../packages/core/fireux-core/src/runtime/*"
      ],
      "#pwa": ["@vite-pwa/nuxt/dist/runtime/composables/index.d.ts"],
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client", "@vite-pwa/nuxt"]
  },
  "include": ["./.nuxt/nuxt.d.ts", "./**/*.ts", "./**/*.d.ts"],
  "exclude": [
    "node_modules",
    "**/node_modules/**/@vite-pwa/nuxt/dist/runtime/components/*.vue"
  ]
}
```

Notes:

- Leave Nuxt’s own aliases (`~`, `@`, `~~`) untouched; they always point to `app/`.
- The legacy `#fireux-core-runtime/*` alias remains for backwards compatibility, but new imports should prefer `fireux-core/runtime/...`.
- For tenant apps, add their own package aliases as needed (e.g. `fireux-cleanbox/*`).

## Environment loading

- App-level `.env` files live next to each Nuxt app (e.g. `projects/misebox/niederhorn/.env`).
- `createFireuxConfig` parses both combined (`FIREBASE_SERVICE_ACCOUNT`) and split Firebase credentials, normalising private keys with `\n` handling.
- VueFire configuration is injected through the `nuxt-vuefire` module options, exposing Firebase config via `runtimeConfig.public.firebaseConfig`.
- Google Places API access comes from `GOOGLE_PLACES_API_KEY` and lands in `runtimeConfig.googlePlacesApiKey` for server handlers like `/api/places/details`.

## Quick checks before shipping config changes

- `pnpm build:packages` should succeed; it exercises module setup for packages and tenants.
- `pnpm dev:<app>` must show the correct module stack in `runtimeConfig.public.modules` (inspect via browser devtools: `useRuntimeConfig()`).
- Run `pnpm lint` if you alter path aliases to ensure ESLint picks up updated config.

---

### Next

- Set up [Firebase (VueFire + Admin)](./copilot-04-firebase.md)
