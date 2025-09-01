# Stage 1 — App Nuxt Config Snapshot

This report captures the current state of all app-level `nuxt.config.*` files alongside the core app config helpers used to compose them. Contents are verbatim for accuracy, followed by quick observations.

## Scope and File Index

Apps (projects/_/_/nuxt.config.ts):

- projects/misebox/niederhorn/nuxt.config.ts
- projects/misebox/misebox-app/nuxt.config.ts
- projects/cleanbox/cleanbox-app/nuxt.config.ts
- projects/cleanbox/richies-reinigung/nuxt.config.ts
- projects/fireux/fireux-app/nuxt.config.ts

Core app config helpers:

- packages/core/fireux-core/src/config/app/fireux-config.ts
- packages/core/fireux-core/src/config/app/base-nuxt.config.ts

---

## Verbatim Contents

### projects/misebox/niederhorn/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    modules: ['fireux-misebox'],
    ecosystem: 'Misebox', // Explicitly declare the  ecosystem
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

### projects/misebox/misebox-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    modules: ['fireux-misebox', 'fireux-jobs'],
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

### projects/cleanbox/cleanbox-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

### projects/cleanbox/richies-reinigung/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig(
  createFireuxConfig({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
  })
)
```

### projects/fireux/fireux-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
// import { createFireuxConfig } from '../../../packages/core/fireux-core/src/config/fireux-config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  ssr: true,
  modules: ['fireux-core'],
  components: [],
  plugins: [],
  css: [],
})
```

### packages/core/fireux-core/src/config/app/fireux-config.ts

```ts
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

```ts
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
