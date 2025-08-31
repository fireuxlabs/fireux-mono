# FireUX Core Config Report

Scope: packages/core/fireux-core/src/config/\*_/_ and packages/core/fireux-core/src/module.ts

Generated as a read-only audit of configuration code. No changes made.

## File Index

- packages/core/fireux-core/src/module.ts
- packages/core/fireux-core/src/config/components-config.ts
- packages/core/fireux-core/src/config/composables-config.ts
- packages/core/fireux-core/src/config/models-config.ts
- packages/core/fireux-core/src/config/pages-config.ts
- packages/core/fireux-core/src/config/plugins-config.ts
- packages/core/fireux-core/src/config/layouts-config.ts
- packages/core/fireux-core/src/config/server-config.ts
- packages/core/fireux-core/src/config/runtime-config.ts
- packages/core/fireux-core/src/config/errors-config.ts
- packages/core/fireux-core/src/config/assets-config.ts
- packages/core/fireux-core/src/config/app/base-nuxt.config.ts
- packages/core/fireux-core/src/config/app/fireux-config.ts

## packages/core/fireux-core/src/module.ts

```typescript
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

/**
 * Public options for the FireUX core module
 */
export interface ModuleOptions {
  /**
   * Prefix for auto-registered components
   * @default 'Fire'
   */
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-core',
    version: '1.0.0',
    configKey: 'fireuxCore',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Call all config steps – these must exist in ./src/config/*
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'core')

    // Nitro tweak (safe to set/merge)
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    // Friendly log
    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log(
        '🔥 fireux-core: module configured (components/composables/models/pages/plugins/server/runtime)'
      )
    })
  },
})

export default module
```

## packages/core/fireux-core/src/config/components-config.ts

```typescript
import { addComponentsDir } from '@nuxt/kit'

export interface ComponentsOptions {
  prefix?: string
}

export function configureComponents(
  resolver: any,
  options: ComponentsOptions = {}
) {
  // Register ALL runtime components; Nuxt will respect the prefix
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: options.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })
}
```

## packages/core/fireux-core/src/config/composables-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables/**
  addImportsDir(resolver.resolve('../runtime/composables'))
}
```

## packages/core/fireux-core/src/config/models-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureModels(resolver: any, _nuxt: any) {
  // Allow importing model helpers/types from runtime/models/** (where it makes sense)
  addImportsDir(resolver.resolve('../runtime/models'))
}
```

## packages/core/fireux-core/src/config/pages-config.ts

```typescript
export function configurePages(resolver: any, nuxt: any) {
  // Expose module pages under a subdir (Nuxt v4: extends-like registration)
  // Add as layered app dir so pages/layouts/middleware are discovered
  nuxt.options._layers = nuxt.options._layers || []
  nuxt.options._layers.push({
    cwd: resolver.resolve('../runtime'),
    config: {},
  })
}
```

## packages/core/fireux-core/src/config/plugins-config.ts

```typescript
import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const maybeClient = resolver.resolve('../runtime/plugins/firebase.client.ts')
  addPlugin({ src: maybeClient, mode: 'client' })
}
```

## packages/core/fireux-core/src/config/layouts-config.ts

```typescript
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register as layout components (CoreDefault/CoreDashboard/CoreDev/CoreDocs/CoreDesign)
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    prefix: 'Core',
    global: true,
    pathPrefix: false,
  })

  // Register layout keys that exist on disk
  const keys = ['default', 'dashboard', 'dev', 'design', 'docs']
  for (const key of keys) {
    const file = join(layoutsDir, `${key}.vue`)
    if (existsSync(file)) {
      addLayout({ src: file, filename: `fireux-core-${key}.vue` }, key)
    }
  }
}
```

## packages/core/fireux-core/src/config/server-config.ts

```typescript
import { addServerHandler } from '@nuxt/kit'

export function configureServer(resolver: any) {
  // Wire up a few server routes (adjust to your actual file names)
  const base = resolver.resolve('../runtime/server/api')

  addServerHandler({ route: '/api/app', handler: `${base}/app.get.ts` })
  // Add more handlers here as you bring routes online
}
```

## packages/core/fireux-core/src/config/runtime-config.ts

```typescript
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  // Augment runtime config namespaces used by this module under public.fireux[key]
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```

## packages/core/fireux-core/src/config/errors-config.ts

```typescript
import { addTemplate } from '@nuxt/kit'

/**
 * Configure error handling for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureErrors(resolver: any, nuxt: any) {
  // Provide a minimal centralized error page following Nuxt 4 defaults
  // Apps can override by creating their own error.vue
  addTemplate({
    filename: 'error.vue',
    getContents: () => `<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold text-gray-900">{{ error?.statusCode || 500 }}</h1>
      <p class="text-gray-600">{{ error?.statusMessage || 'Something went wrong' }}</p>
      <div class="space-x-4">
        <button 
          @click="handleError" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
        <a 
          href="/" 
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Go home
        </a>
      </div>
    </div>
  </div>
</template>`,
  })
}
```

## packages/core/fireux-core/src/config/assets-config.ts

```typescript
/**
 * Configure public assets for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureAssets(resolver: any, nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add CSS files to Nuxt automatically - this makes the module truly sovereign
  const mainCssPath = resolvePath('./runtime/assets/styles/main.css')

  // Register CSS with Nuxt automatically
  nuxt.options.css = nuxt.options.css || []
  // Add main CSS (which imports our SCSS organisms)
  nuxt.options.css.push(mainCssPath)

  // Configure Nitro to serve public assets from the package
  nuxt.options.nitro = nuxt.options.nitro || {}
  nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []

  // Add fireux-core public directory to Nitro's public assets
  nuxt.options.nitro.publicAssets.push({
    baseURL: '/',
    dir: resolvePath('./runtime/public'),
    maxAge: 60 * 60 * 24 * 7, // 7 days cache
  })

  // Expose public directory and assets directory for advanced usage
  nuxt.options.alias = nuxt.options.alias || {}
  nuxt.options.alias['#fireux-core-public'] = resolvePath('./runtime/public')
  nuxt.options.alias['#fireux-core-assets'] = resolvePath('./runtime/assets')
}
```

## packages/core/fireux-core/src/config/app/base-nuxt.config.ts

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

## packages/core/fireux-core/src/config/app/fireux-config.ts

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

## Analysis

Key findings and notes:

- Module metadata and defaults:
  - name: fireux-core; configKey: fireuxCore; default component prefix: 'Fire'.
  - setup wires components, composables, models, pages, plugins, layouts, server, and runtime namespaces; enables Nitro experimental WASM.

- Unwired config files:
  - assets-config.ts and errors-config.ts exist but are not invoked from module.ts. If intended, add configureAssets(...) and configureErrors(...) in setup to activate CSS/public assets and the centralized error template.

- Component and layout registration:
  - Components are auto-imported from runtime/components with prefix 'Fire' (matches docs).
  - Layouts are also registered as components with prefix 'Core' and as Nuxt layouts for keys: default, dashboard, dev, design, docs. This is acceptable but differs from the component prefix convention; document the distinction.

- Pages layer registration:
  - Uses nuxt.options.\_layers push to add runtime as a layer. This relies on an internal property; consider using official extend/layer APIs if available in Nuxt 4 to avoid breakage.

- Plugins and server handlers:
  - Adds client plugin runtime/plugins/firebase.client.ts.
  - Adds server handler for GET /api/app -> runtime/server/api/app.get.ts.

- Runtime config namespace:
  - Ensures nuxt.options.runtimeConfig.public.fireux.core exists with defaults { enabled: true }.

- App config templates under core/config/app:
  - createFireuxConfig and createBaseNuxtConfig provide a shared app config factory, including modules: 'fireux-core', optional domain modules, @nuxt/content, @nuxt/ui, PWA, and nuxt-vuefire.
  - Environment variables consumed: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID, GOOGLE_APPLICATION_CREDENTIALS.
  - Nitro preset 'firebase' configured; production ignore includes '\*_/_.doc.\*' and optionally dev pages.

- Styling system compliance:
  - errors-config.ts template uses Tailwind utility classes (e.g., min-h-screen, text-4xl). FireUX prohibits utility classes; replace with semantic classes (e.g., error-page, error-title, error-actions) if you decide to wire this template.

- Domain separation:
  - All code shown is domain-agnostic and belongs in core. No domain-specific logic detected.

- Aliases and assets:
  - assets-config.ts would set aliases '#fireux-core-public' and '#fireux-core-assets' and inject main.css; currently unused unless wired in.

- Potential next steps (optional, low risk):
  - Wire configureAssets and configureErrors in module.ts if desired.
  - Replace Tailwind utilities in the error template with semantic classes, consistent with FireUX styling rules.
  - Consider replacing nuxt.options.\_layers usage with a stable API when available.

This report is informational only. No repository files were modified other than adding this Markdown report.
