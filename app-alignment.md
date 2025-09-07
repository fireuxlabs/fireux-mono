# App Alignment Report

This document lists key config files (package.json, tsconfig, nuxt.config) for each app to align conventions across projects.

## Cleanbox: projects/cleanbox/cleanbox-app

- package.json

```json
{
  "name": "cleanbox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3002",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/ui": "3.1.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "@vueup/vue-quill": "^1.2.0",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "firebase-admin": "^13.4.0",
    "fireux-cleanbox": "workspace:*",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "nuxt": "4.0.3",
    "nuxt-vuefire": "^1.1.0",
    "stripe": "^18.3.0",
    "vue": "3.5.20",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62",
    "@nuxt/content": "^3.6.3",
    "rimraf": "^6.0.1"
  }
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": false,
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "skipLibCheck": true,
    "types": ["nuxt", "nuxt/schema"]
  },
  "include": ["./**/*"]
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME ?? 'Cleanbox',
    appShortName: process.env.APP_SHORT_NAME ?? 'Cleanbox',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#000000',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

## Richies: projects/cleanbox/richies-reinigung

- package.json

```json
{
  "name": "richies-reinigung",
  "private": true,
  "type": "module",
  "scripts": {"dev":"nuxi dev --port 3004","build":"nuxi build","generate":"nuxi generate","preview":"nuxi preview","check:env":"node scripts/check-env.mjs","postinstall":"nuxi prepare","clean":"rimraf .nuxt dist"},
  "dependencies": {"@nuxt/ui":"3.1.3","@vite-pwa/nuxt":"^1.0.4","@vueup/vue-quill":"^1.2.0","dompurify":"^3.2.6","firebase":"11.10.0","firebase-admin":"^13.4.0","fireux-cleanbox":"workspace:*","fireux-core":"workspace:*","fireux-jobs":"workspace:*","nuxt":"4.0.3","nuxt-vuefire":"^1.1.0","stripe":"^18.3.0","vue":"3.5.20","vue-router":"^4.5.1"},
  "devDependencies": {"@iconify-json/heroicons":"^1.2.2","@iconify-json/lucide":"^1.2.62","@nuxt/content":"^3.6.3","rimraf":"^6.0.1"}
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {"composite": false, "baseUrl": ".", "moduleResolution": "Bundler", "paths": {"fireux-core/*": ["../../../packages/core/fireux-core/src/*"], "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"], "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"], "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]}, "skipLibCheck": true, "types": ["nuxt", "nuxt/schema"]},
  "include": ["./**/*"]
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME ?? 'Richies',
    appShortName: process.env.APP_SHORT_NAME ?? 'Richies',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#000000',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

## Misebox: projects/misebox/misebox-app

- package.json

```json
{
  "name": "misebox-app",
  "private": true,
  "type": "module",
  "scripts": {"dev":"nuxi dev --port 3001","build":"nuxi build","generate":"nuxi generate","preview":"nuxi preview","check:env":"node scripts/check-env.mjs","postinstall":"nuxi prepare","clean":"rimraf .nuxt dist","migrate:chefs":"tsx scripts/migrate-chef-data.ts"},
  "dependencies": {"@nuxt/ui":"3.1.3","@vite-pwa/nuxt":"^1.0.4","@vueup/vue-quill":"^1.2.0","dompurify":"^3.2.6","firebase":"11.10.0","firebase-admin":"^13.4.0","fireux-core":"workspace:*","fireux-jobs":"workspace:*","fireux-misebox":"workspace:*","nuxt":"4.0.3","nuxt-vuefire":"^1.1.0","stripe":"^18.3.0","vue":"3.5.20","vue-router":"^4.5.1"},
  "devDependencies": {"@iconify-json/heroicons":"^1.2.2","@iconify-json/lucide":"^1.2.62","@nuxt/content":"^3.6.3","rimraf":"^6.0.1"}
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {"composite": false, "baseUrl": ".", "moduleResolution": "Bundler", "paths": {"fireux-core/*": ["../../../packages/core/fireux-core/src/*"], "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"], "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"], "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]}, "skipLibCheck": true, "types": ["nuxt", "nuxt/schema"]},
  "include": ["./**/*"]
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-misebox'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME ?? 'Misebox',
    appShortName: process.env.APP_SHORT_NAME ?? 'Misebox',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#8B5CF6',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

## Niederhorn: projects/misebox/niederhorn

- package.json

```json
{
  "name": "Niederhorn",
  "private": true,
  "type": "module",
  "scripts": {"dev":"nuxi dev --port 3003","build":"nuxi build","generate":"nuxi generate","preview":"nuxi preview","check:env":"node scripts/check-env.mjs","postinstall":"nuxi prepare","clean":"rimraf .nuxt dist"},
  "dependencies": {"@nuxt/ui":"3.1.3","@vite-pwa/nuxt":"^1.0.4","@vueup/vue-quill":"^1.2.0","dompurify":"^3.2.6","firebase":"11.10.0","firebase-admin":"^13.4.0","fireux-core":"workspace:*","fireux-jobs":"workspace:*","fireux-misebox":"workspace:*","nuxt":"4.0.3","nuxt-vuefire":"^1.1.0","stripe":"^18.3.0","vue":"3.5.20","vue-router":"^4.5.1"},
  "devDependencies": {"@iconify-json/heroicons":"^1.2.2","@iconify-json/lucide":"^1.2.62","rimraf":"^6.0.1"}
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {"composite": false, "baseUrl": ".", "moduleResolution": "Bundler", "paths": {"fireux-core/*": ["../../../packages/core/fireux-core/src/*"], "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"], "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"], "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]}, "skipLibCheck": true, "types": ["nuxt", "nuxt/schema"]},
  "include": ["./**/*"]
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-misebox'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME ?? 'Niederhorn',
    appShortName: process.env.APP_SHORT_NAME ?? 'Niederhorn',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#0EA5E9',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

## FireUX: projects/fireux/fireux-app

- package.json

```json
{
  "name": "fireux-app",
  "private": true,
  "type": "module",
  "scripts": {"dev":"nuxi dev --port 3000","build":"nuxi build","generate":"nuxi generate","preview":"nuxi preview","check:env":"node scripts/check-env.mjs","postinstall":"nuxi prepare","clean":"rimraf .nuxt dist"},
  "dependencies": {"firebase":"11.10.0","fireux-core":"workspace:*","nuxt":"4.0.3","nuxt-vuefire":"^1.1.0","@nuxt/ui":"3.1.3","@nuxt/icon":"2.x","vue":"3.5.20","vue-router":"4.5.1"},
  "devDependencies": {"@vite-pwa/nuxt":"^1.0.4","tailwindcss":"^4.1.12","rimraf":"^6.0.1"}
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {"baseUrl": ".", "paths": {"fireux-core": ["../../../packages/core/fireux-core/src/module.ts"], "fireux-core/*": ["../../../packages/core/fireux-core/src/*"], "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]}, "skipLibCheck": true, "types": ["nuxt", "nuxt/schema"]},
  "include": ["./**/*"]
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-fireux'],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX',
    appShortName: process.env.APP_SHORT_NAME ?? 'FireUX',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

## FireUX Tennant: projects/fireux/tennant

- package.json

```json
{
  "name": "fireux-tennant",
  "private": true,
  "type": "module",
  "scripts": {"dev":"nuxi dev --port 3005","build":"nuxi build","generate":"nuxi generate","preview":"nuxi preview","check:env":"node scripts/check-env.mjs","postinstall":"nuxi prepare","clean":"rimraf .nuxt dist"},
  "dependencies": {"nuxt":"4.0.3","fireux-core":"workspace:*","nuxt-vuefire":"^1.1.0","firebase":"11.10.0","@nuxt/ui":"3.1.3","@nuxt/icon":"2.x","vue":"3.5.20","vue-router":"4.5.1"},
  "devDependencies": {"@vite-pwa/nuxt":"^1.0.4","rimraf":"^6.0.1"}
}
```

- tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {"composite": false, "baseUrl": ".", "moduleResolution": "Bundler", "paths": {"fireux-core": ["../../../packages/core/fireux-core/src/module.ts"], "fireux-core/*": ["../../../packages/core/fireux-core/src/*"], "fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"], "fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"], "~~/*": ["./*"], "~/*": ["./*"], "@/*": ["./*"]}, "skipLibCheck": true, "types": ["nuxt", "nuxt/schema"]}
}
```

- nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const config: NuxtConfig = defineNuxtConfig({
  ...createFireuxConfig({
    modules: ['fireux-fireux'],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX Tennant',
    appShortName: process.env.APP_SHORT_NAME ?? 'Tenant',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#3B82F6',
    neutralColor: process.env.APP_NEUTRAL_COLOR ?? '#64748B',
    vuefire: { auth: { enabled: true, sessionCookie: false } },
  }),
  compatibilityDate: '2025-09-01',
})

export default config
```

---

Notes:
- All apps use createFireuxConfig with ecosystem, color, and modules.
- TS configs extend Nuxt-generated .nuxt/tsconfig.json and map to workspace sources for DX.
- Ports: 3000 fireux, 3001 misebox, 3002 cleanbox, 3003 niederhorn, 3004 richies.
