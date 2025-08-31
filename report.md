# FireUX Base Nuxt Config Resolution Report

## File index (absolute)

- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/package.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/fireux-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/base-nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/fireux-app/nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/misebox-app/nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/niederhorn/nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/cleanbox-app/nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/richies-reinigung/nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/tsconfig.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/fireux/fireux-app/tsconfig.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/misebox-app/tsconfig.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/misebox/niederhorn/tsconfig.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/cleanbox-app/tsconfig.json
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/projects/cleanbox/richies-reinigung/tsconfig.json

## Verbatim contents

### packages/core/fireux-core/package.json

```json
{
  "name": "fireux-core",
  "version": "0.1.0",
  "description": "FireUX Core - A comprehensive Nuxt 3 module for Firebase integration",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": {
      "types": "./src/module.ts",
      "import": "./src/module.ts"
    },
    "./runtime/*": {
      "types": "./src/runtime/*",
      "import": "./src/runtime/*"
    },
    "./config/*": {
      "types": "./src/config/*",
      "import": "./src/config/*"
    },
    "./config/app/*": {
      "types": "./src/config/app/*",
      "import": "./src/config/app/*"
    },
    "./config/app/base-nuxt.config": {
      "types": "./src/config/app/base-nuxt.config.ts",
      "import": "./src/config/app/base-nuxt.config.ts"
    },
    "./config/app/fireux-config": {
      "types": "./src/config/app/fireux-config.ts",
      "import": "./src/config/app/fireux-config.ts"
    },
    "./package.json": "./package.json"
  },
  "files": ["src/**/*"],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "dompurify": "^3.2.6"
  },
  "peerDependencies": {
    "nuxt": "4.0.3",
    "@nuxt/kit": "4.0.3",
    "@nuxt/schema": "4.0.3",
    "vue": "3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "3.2.2",
    "firebase": "11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "glob": "^11.0.3",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "rimraf": "^6.0.1"
  },
  "type": "module"
}
```

### packages/core/fireux-core/src/config/app/fireux-config.ts

```typescript
// FireUX Configuration Template for all FireUX apps
// This ensures consistent configuration across all tenants
// ✅ PROVEN PATTERN - Based on working misebox-app configuration

export interface TenantConfig {
  modules?: string[] // Array of modules to include, e.g., ['fireux-jobs', 'fireux-misebox']
  ecosystem?: string // Business ecosystem (e.g., 'misebox', 'cleanbox')
  appName?: string // Allow environment variables which can be undefined
  appShortName?: string // Allow environment variables which can be undefined
  primaryColor?: string // Allow environment variables which can be undefined
  neutralColor?: string // Optional neutral color for theming
}

export const createFireuxConfig = (config: TenantConfig) => {
  // Build modules array with core and optional modules
  const modules = [
    'fireux-core',
    // Include additional modules if specified
    ...(config.modules || []),
    '@nuxt/content',
    '@nuxt/ui',
    [
      '@vite-pwa/nuxt',
      {
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
      },
    ],
    [
      'nuxt-vuefire',
      {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.FIREBASE_APP_ID,
          measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        },
        auth: {
          enabled: true,
          ssr: true,
        },
        admin: {
          serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        },
      },
    ],
  ]

  // Ensure all required arrays are properly initialized
  const baseConfig = {
    devtools: { enabled: true },
    compatibilityDate: '2025-06-07',
    srcDir: 'app/',
    dir: {
      public: '../public',
    },
    imports: {
      dirs: ['composables/**', 'models/**', 'utils/**'],
    },

    // Explicitly configure SSR for consistency
    ssr: true,

    modules,

    // Ensure components array is initialized
    components: [],

    // Ensure plugins array is initialized
    plugins: [],

    // Ensure css array is initialized
    css: [],

    // Simple: just pass ecosystem in runtimeConfig
    runtimeConfig: {
      public: {
        ecosystem: config.ecosystem,
        modules: config.modules || [],
      },
    },

    nitro: {
      preset: 'firebase',
      firebase: {
        gen: 2,
      },
      ignore: [
        // Exclude development pages from production builds
        ...(process.env.NODE_ENV === 'production' ? ['**/pages/dev/**'] : []),
        // Exclude documentation files (already established pattern)
        '**/*.doc.*',
      ],
    },

    // Ensure typescript config has properly initialized arrays
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {},
        },
      },
    },
  }

  return baseConfig as any
}

// String template generator for backward compatibility
export const createFireuxConfigString = (options: {
  modules?: string[]
  appName: string
  appShortName: string
  primaryColor: string
  neutralColor?: string
  port?: number
}) => {
  const modulesString = options.modules
    ? `
  modules: [${options.modules.map((m) => "'" + m + "'").join(', ')}],`
    : ''

  return `import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from 'fireux-core/config/fireux-config'

export default defineNuxtConfig(createFireuxConfig({${modulesString}
  appName: '${options.appName}',
  appShortName: '${options.appShortName}',
  primaryColor: '${options.primaryColor}',${
    options.neutralColor
      ? `
  neutralColor: '${options.neutralColor}',`
      : ''
  }
}))`
}
```

### packages/core/fireux-core/src/config/app/base-nuxt.config.ts

```typescript
import { createFireuxConfig } from './fireux-config'
import type { TenantConfig } from './fireux-config'

// Base Nuxt configuration shared across all FireUX apps
// This now wraps createFireuxConfig for a single source of truth
export const createBaseNuxtConfig = (appConfig: {
  appName: string
  appShortName: string
  primaryColor: string
  modules: string[]
  port: number
  ecosystem?: string
  neutralColor?: string
}) => {
  // Compose the config for createFireuxConfig
  const fireuxConfig: TenantConfig = {
    appName: appConfig.appName,
    appShortName: appConfig.appShortName,
    primaryColor: appConfig.primaryColor,
    modules: appConfig.modules,
    ecosystem: appConfig.ecosystem,
    neutralColor: appConfig.neutralColor,
  }
  // Get the base config from fireux
  const base = createFireuxConfig(fireuxConfig)
  // You can extend/override here if needed
  return {
    ...base,
    server: {
      port: appConfig.port,
    },
    // Example: add/override fonts, tailwind, etc.
    googleFonts: {
      families: {
        Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
    },
    tailwindcss: {
      cssPath: '~/assets/css/tailwind.css',
      configPath: 'tailwind.config',
    },
    // Any other app-specific overrides can go here
  }
}
```

### projects/fireux/fireux-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-core'],
    ecosystem: 'fireux',
    appName: process.env.APP_NAME ?? 'FireUX',
    appShortName: process.env.APP_SHORT_NAME ?? 'FireUX',
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3000,
  })
)
```

### projects/misebox/misebox-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-misebox', 'fireux-jobs'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3001,
  })
)
```

### projects/misebox/niederhorn/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-misebox'],
    ecosystem: 'misebox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3003,
  })
)
```

### projects/cleanbox/cleanbox-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3002,
  })
)
```

### projects/cleanbox/richies-reinigung/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import { createBaseNuxtConfig } from 'fireux-core/config/app/base-nuxt.config'

export default defineNuxtConfig(
  createBaseNuxtConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3004,
  })
)
```

### tsconfig.json (root)

```jsonc
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "projects/fireux/fireux-app" },
    { "path": "projects/misebox/misebox-app" },
    { "path": "projects/misebox/niederhorn" },
    { "path": "projects/cleanbox/cleanbox-app" },
    { "path": "projects/cleanbox/richies-reinigung" },
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" },
  ],
}
```

### projects/fireux/fireux-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
  },
}
```

### projects/misebox/misebox-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "types": ["nuxt", "nuxt/schema", "vue-router", "@types/node"],
    "skipLibCheck": true,
  },
}
```

### projects/misebox/niederhorn/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "@fireux-misebox/*": ["../../../packages/tenants/fireux-misebox/src/*"],
      "@fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "types": ["@nuxt/devtools"],
  },
}
```

### projects/cleanbox/cleanbox-app/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "@fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../../../packages/extensions/fireux-places/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
  },
  "include": [
    "./**/*",
    "../../../packages/tenants/fireux-cleanbox/src/**/*.ts",
  ],
}
```

### projects/cleanbox/richies-reinigung/tsconfig.json

```jsonc
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../../../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../../../packages/extensions/fireux-jobs/src/*"],
      "@fireux-cleanbox/*": ["../../../packages/tenants/fireux-cleanbox/src/*"],
      "~~/*": ["./*"],
      "~/*": ["./*"],
      "@/*": ["./*"],
    },
    "types": ["@nuxt/devtools"],
  },
  "include": [
    "./**/*",
    "../../../packages/tenants/fireux-cleanbox/src/**/*.ts",
  ],
}
```

## Analysis

- The import path used by apps is `fireux-core/config/app/base-nuxt.config`.
- Resolution is controlled by the package exports in `packages/core/fireux-core/package.json` and the presence of the referenced source file under `packages/core/fireux-core/src/config/app/base-nuxt.config.ts`.
- The exports map includes both a wildcard (`./config/app/*`) and explicit entries for `./config/app/base-nuxt.config` and `./config/app/fireux-config`, each with `types` and `import` pointing at `.ts` sources. This enables TS and bundlers to resolve the subpath.
- App tsconfigs extend the Nuxt-generated `.nuxt/tsconfig.json`. Their custom `paths` only target `@fireux-*` aliases and don’t override `fireux-core/*`, so they won’t block subpath resolution.
- If editors still show “Cannot find module …”: restart the TS server or reload the window to pick up the updated exports; ensure the workspace uses the project’s TypeScript version. You can also add an optional paths alias fallback: `"fireux-core/config/*": ["packages/core/fireux-core/src/config/*"]` in the app tsconfig, but it shouldn’t be necessary now.

This report is read-only; no files were modified.
