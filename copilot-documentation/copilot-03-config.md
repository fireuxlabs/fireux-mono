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
    modules: ['fireux-misebox'],   // add more: 'fireux-jobs', etc.
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

## TypeScript
- Root tsconfig.base.json uses:
  - "module": "ESNext", "moduleResolution": "Bundler"
  - central "paths" to packages/**/src/*
- App tsconfig.json:

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]
    },
    "skipLibCheck": true
  },
  "include": ["./**/*"]
}
```

## Environment loading
- .env next to the app (e.g. projects/misebox/niederhorn/.env)
- VueFire reads Firebase keys from createFireuxConfig → modules: ['nuxt-vuefire', {...}]
- Public mirroring is set under runtimeConfig.public.firebaseConfig if/when needed.

## fireux-core exports → import paths
Common subpath exports and how to import them from apps:

- Export: "./config/app/*" → Import: `import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'`
- Export: "./config/*" → Import: `import { someHelper } from 'fireux-core/config/some-helper'`
- Export: "./runtime/*" → Import: `import { something } from 'fireux-core/runtime/something'`

Note: Packages export directly from `src/` via package.json#exports (src-first). Avoid deep relative imports across packages.

---

### Next
- Set up [Firebase (VueFire + Admin)](./copilot-04-firebase.md)
