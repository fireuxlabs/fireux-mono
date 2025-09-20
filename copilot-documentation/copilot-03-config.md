---
title: Config (Nuxt / TypeScript / Env)
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Config (Nuxt / TypeScript / Env)

## Nuxt (apps)

```ts
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    modules: ['fireux-misebox'], // add more: 'fireux-jobs', etc.
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

## TypeScript

- Root `tsconfig.json` uses:
  - "module": "ESNext", "moduleResolution": "Bundler"
  - central "paths" to packages/\*_/src/_
- App tsconfig.json:

```json
{
  "extends": "../tsconfig.app.base.json",
  "files": ["../../../types/fireux.d.ts"],
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

## Environment loading

- .env next to the app (e.g. `projects/misebox/niederhorn/.env`)
- VueFire reads Firebase keys from `createFireuxConfig` via the `nuxt-vuefire` module options
- Public mirroring is exposed at `runtimeConfig.public.firebaseConfig`

## fireux-core exports → import paths

Common subpath exports and how to import them from apps:

- Export: "./config/app/\*" → Import: `import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'`
- Export: "./config/\*" → Import: `import { someHelper } from 'fireux-core/config/some-helper'`
- Export: "./runtime/\*" → Import: `import { something } from 'fireux-core/runtime/something'`

Note: Packages export directly from `src/` via package.json#exports (src-first). Avoid deep relative imports across packages.

---

### Next

- Set up [Firebase (VueFire + Admin)](./copilot-04-firebase.md)
