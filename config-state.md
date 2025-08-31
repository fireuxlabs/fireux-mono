Here’s a read-only snapshot of all module.ts files and config files under packages/_/_/src/config/\*_/_ as requested.

# FireUX Module & Config Snapshot

## File Index

- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/module.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/module.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/module.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/module.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/module.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/assets-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/composables-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/components-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/errors-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/layouts-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/models-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/pages-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/plugins-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/runtime-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/server-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/base-nuxt.config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/fireux-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/components-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/composables-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/models-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/layouts-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/pages-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/plugins-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/runtime-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/server-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/components-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/composables-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/models-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/layouts-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/runtime-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/components-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/composables-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/layouts-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/models-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/pages-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/runtime-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/components-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/composables-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/models-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/pages-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/layouts-config.ts
- /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/runtime-config.ts

## Files

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/module.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/module.ts

```typescript
import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureLayouts } from './config/layouts-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    configureServer(resolver)
    configureRuntime(nuxt, 'jobs')
    // Safe nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true
  },
})
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/module.ts

```typescript
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-places',
    version: '0.1.0',
    configKey: 'fireuxPlaces',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver, options)
    configureModels(resolver, options)
    configureLayouts(resolver, nuxt)
    configureRuntime(nuxt, 'places')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log(
        'fireux-places: module configured (components/composables/models/runtime)'
      )
    })
  },
})

export default module
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/module.ts

```typescript
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config.ts'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-cleanbox',
    version: '0.1.0',
    configKey: 'fireuxCleanbox',
  },
  defaults: {
    prefix: 'Clean',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver, nuxt)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configureRuntime(nuxt, 'cleanbox')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-cleanbox: module configured')
    })
  },
})

export default module
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/module.ts

```typescript
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config.ts'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configureRuntime(nuxt, 'misebox')

    // Nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-misebox: module configured')
    })
  },
})

export default module
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/assets-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/composables-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables/**
  addImportsDir(resolver.resolve('../runtime/composables'))
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/components-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/errors-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/layouts-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/models-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureModels(resolver: any, _nuxt: any) {
  // Allow importing model helpers/types from runtime/models/** (where it makes sense)
  addImportsDir(resolver.resolve('../runtime/models'))
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/pages-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/plugins-config.ts

```typescript
import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const maybeClient = resolver.resolve('../runtime/plugins/firebase.client.ts')
  addPlugin({ src: maybeClient, mode: 'client' })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/runtime-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/server-config.ts

```typescript
import { addServerHandler } from '@nuxt/kit'

export function configureServer(resolver: any) {
  // Wire up a few server routes (adjust to your actual file names)
  const base = resolver.resolve('../runtime/server/api')

  addServerHandler({ route: '/api/app', handler: `${base}/app.get.ts` })
  // Add more handlers here as you bring routes online
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/base-nuxt.config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/core/fireux-core/src/config/app/fireux-config.ts

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

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/components-config.ts

```typescript
import { addComponentsDir } from '@nuxt/kit'
export function configureComponents(resolver: any, opts?: { prefix?: string }) {
  addComponentsDir({
    path: resolver.resolve('../runtime/components'),
    prefix: opts?.prefix ?? 'Fire',
    global: false,
    pathPrefix: false,
  })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/composables-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'
export function configureComposables(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/composables'))
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/models-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'
export function configureModels(resolver: any) {
  addImportsDir(resolver.resolve('../runtime/models'))
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/layouts-config.ts

```typescript
import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt: any) {
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/pages-config.ts

```typescript
export function configurePages(resolver: any, nuxt: any) {
  nuxt.options._layers ||= []
  nuxt.options._layers.push({ cwd: resolver.resolve('../runtime'), config: {} })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/plugins-config.ts

```typescript
import { addPlugin } from '@nuxt/kit'
import { existsSync } from 'node:fs'
export function configurePlugins(resolver: any) {
  const client = resolver.resolve('../runtime/plugins/firebase.client.ts')
  if (existsSync(client)) addPlugin({ src: client, mode: 'client' })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/runtime-config.ts

```typescript
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/config/server-config.ts

```typescript
import { addServerHandler } from '@nuxt/kit'
import { existsSync } from 'node:fs'
export function configureServer(resolver: any) {
  const appGet = resolver.resolve('../runtime/server/api/app.get.ts')
  if (existsSync(appGet))
    addServerHandler({ route: '/api/app', handler: appGet })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/components-config.ts

```typescript
import { addComponent } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'
import { glob } from 'glob'
import { resolve } from 'path'

export async function configureComponents(
  resolver: Resolver,
  options: ModuleOptions
) {
  // Get all component files
  const componentFiles = await glob('**/*.vue', {
    cwd: resolver.resolve('./runtime/components'),
    absolute: false,
  })

  // Register each component
  for (const file of componentFiles) {
    const componentPath = resolver.resolve('./runtime/components', file)
    const componentName = generateComponentName(file)

    addComponent({
      name: componentName,
      filePath: componentPath,
    })
  }
}

function generateComponentName(filePath: string): string {
  // Remove .vue extension and convert path to PascalCase
  const withoutExtension = filePath.replace(/\.vue$/, '')
  const parts = withoutExtension.split('/')

  // Create component name with Fire prefix and namespace
  const pascalCaseName = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return `Fire${pascalCaseName}`
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/composables-config.ts

```typescript
import { addImports } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'
import { glob } from 'glob'

export async function configureComposables(
  resolver: Resolver,
  options: ModuleOptions
) {
  try {
    // Get all composable files
    const composableFiles = await glob('**/*.ts', {
      cwd: resolver.resolve('./runtime/composables'),
      absolute: false,
    })

    // Register each composable
    for (const file of composableFiles) {
      const composablePath = resolver.resolve('./runtime/composables', file)
      const composableName = generateComposableName(file)

      addImports({
        name: composableName,
        from: composablePath,
      })
    }
  } catch (error) {
    console.warn('FireUX Places: No composables directory found')
  }
}

function generateComposableName(filePath: string): string {
  // Extract the filename without extension
  const fileName = filePath.split('/').pop()?.replace(/\.ts$/, '') || ''

  // If it starts with 'use', return as-is, otherwise prepend 'use'
  if (fileName.startsWith('use')) {
    return fileName
  }

  // Convert to camelCase and prepend 'use'
  const camelCase = fileName.charAt(0).toUpperCase() + fileName.slice(1)
  return `use${camelCase}`
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/models-config.ts

```typescript
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from '../module'

export async function configureModels(
  resolver: Resolver,
  options: ModuleOptions
) {
  // Models configuration - copy model files to runtime
  // This will be used for TypeScript interfaces and types
  console.log('FireUX Places: Models configured')
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/layouts-config.ts

```typescript
import { addComponentsDir } from '@nuxt/kit'
import { existsSync } from 'node:fs'

export function configureLayouts(resolver: any, _nuxt: any) {
  const dir = resolver.resolve('./runtime/layouts')
  if (!existsSync(dir)) return
  addComponentsDir({
    path: dir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-places/src/config/runtime-config.ts

```typescript
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/components-config.ts

```typescript
import { addComponentsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export interface ModuleOptions {
  prefix?: string
}

export function configureComponents(
  resolver: Resolver,
  options: ModuleOptions
) {
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: 'Cleanbox',
    pathPrefix: false,
  })

  console.log(`🧽 CleanBox components registered with prefix: Cleanbox`)
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/composables-config.ts

```typescript
import { addImportsDir } from '@nuxt/kit'
import type { Resolver } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)
  addImportsDir([resolvePath('./runtime/composables/**')])
  // Optionally, add models directory for auto-import (uncomment if needed):
  // addImportsDir(resolvePath('./runtime/models'))
  console.log('🧽 CleanBox composables auto-imported')
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/layouts-config.ts

```typescript
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure cleanbox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  for (const key of ['CleanboxDefault', 'CleanboxDashboard', 'CleanboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `cleanbox-${key}.vue` }, key)
  }
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/models-config.ts

```typescript
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configureModels(resolver: Resolver, nuxt: Nuxt) {
  // Configure cleanbox-specific models here when needed
  console.log('🧽 CleanBox models configured')
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/pages-config.ts

```typescript
import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export function configurePages(resolver: Resolver, nuxt: Nuxt) {
  // Configure cleanbox-specific pages here when needed
  console.log('🧽 CleanBox pages configured')
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-cleanbox/src/config/runtime-config.ts

```typescript
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/components-config.ts

```typescript
/**
 * Components Configuration for FireUX Misebox
 *
 * Auto-imports all Chef and Supplier components with proper naming to avoid conflicts
 */
import { Resolver, addComponentsDir } from '@nuxt/kit'

export function configureComponents(
  resolver: Resolver,
  options: { prefix?: string }
) {
  // Add Chef profile components with MiseProfiles prefix to include full path
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    pathPrefix: true,
    prefix: 'Mise',
    global: true,
  })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/composables-config.ts

```typescript
/**
 * Composables Configuration for FireUX Misebox
 *
 * Auto-imports Chef and Supplier composables from specific directories
 */
import { Resolver, addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: Resolver) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Add all composable directories for auto-import
  addImportsDir([resolvePath('./runtime/composables/**')])

  // Add models directory for auto-import
  addImportsDir(resolver.resolve('./runtime/models'))
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/models-config.ts

```typescript
/**
 * Models Configuration for FireUX Misebox
 *
 * Auto-import all model interfaces in runtime/models/{profiles,objects} using a glob.
 * Each model file exporting an interface named after the file (PascalCase + .model.ts)
 * will be exposed as a global constant referencing its type.
 *
 * Example: runtime/models/objects/Ingredient.model.ts -> global const Ingredient
 */
import type { Resolver } from '@nuxt/kit'
import { addTypeTemplate } from '@nuxt/kit'
import { globSync } from 'glob'
import { relative } from 'pathe'

function toGlobalName(file: string) {
  // Expect .../<Dir>/<Name>.model.ts
  const base = file.split(/[\\/]/).pop() || ''
  const name = base.replace(/\.model\.ts$/, '')
  return name
}

export function configureModels(resolver: Resolver) {
  const root = resolver.resolve('.')
  const patterns = [
    resolver.resolve('./runtime/models/profiles/**/*.model.ts'),
    resolver.resolve('./runtime/models/objects/**/*.model.ts'),
  ]
  const files = patterns.flatMap((p) =>
    globSync(p, { windowsPathsNoEscape: true })
  )
  const decls = files
    .map((abs) => {
      const globalName = toGlobalName(abs)
      // Build import path relative to current config root for the template
      const rel = relative(root, abs).replace(/\\/g, '/')
      return `  const ${globalName}: typeof import('${resolver.resolve('./' + rel)}').${globalName}`
    })
    .join('\n')

  addTypeTemplate({
    filename: 'types/misebox-models.d.ts',
    getContents: () => `declare global {\n${decls}\n}\n\nexport {}\n`,
  })
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/pages-config.ts

```typescript
import { extendPages } from '@nuxt/kit'
import { globSync } from 'glob'
import { resolve } from 'path'

/**
 * Pages Configuration for FireUX Misebox
 *
 * Auto-discovers and registers all pages using glob patterns
 */
export function configurePages(resolver: any, _nuxt: any) {
  const resolvePath = (p: string) => resolver.resolve(p)

  // Get the runtime pages directory
  const pagesDir = resolvePath('./runtime/pages')

  // Find all .vue files in the pages directory recursively
  const pageFiles = globSync('**/*.vue', {
    cwd: pagesDir,
    absolute: false,
  })

  console.log(
    `🔍 Found ${pageFiles.length} page files in misebox runtime/pages/`
  )

  // Extend pages to include all discovered pages
  extendPages((pages) => {
    pageFiles.forEach((pageFile) => {
      const resolvedPath = resolve(pagesDir, pageFile)

      // Convert file path to route path
      const routePath = convertFilePathToRoute(pageFile)

      // Generate page name from file path
      const pageName = convertFilePathToPageName(pageFile)

      console.log(`📄 Misebox page: ${pageName} -> ${routePath} (${pageFile})`)

      pages.push({
        name: pageName,
        path: routePath,
        file: resolvedPath,
      })
    })
  })
}

/**
 * Convert file path to route path following Nuxt conventions
 * @param filePath - The file path relative to pages directory
 * @returns The route path
 */
function convertFilePathToRoute(filePath: string): string {
  let routePath = filePath
    .replace(/\.vue$/, '') // Remove .vue extension
    .replace(/\/index$/, '') // Remove /index
    .replace(/\[([^\]]+)\]/g, ':$1') // Convert [param] to :param

  // Handle root index
  if (routePath === 'index') {
    routePath = ''
  }

  // Ensure leading slash
  if (routePath && !routePath.startsWith('/')) {
    routePath = '/' + routePath
  }

  // Handle empty route (root)
  if (!routePath) {
    routePath = '/'
  }

  return routePath
}

/**
 * Convert file path to page name
 * @param filePath - The file path relative to pages directory
 * @returns The page name
 */
function convertFilePathToPageName(filePath: string): string {
  return filePath
    .replace(/\.vue$/, '') // Remove .vue extension
    .replace(/\[([^\]]+)\]/g, '$1') // Convert [param] to param
    .replace(/\//g, '-') // Convert slashes to dashes
    .replace(/(^-+)|(-+$)/g, '') // Remove leading/trailing dashes
    .toLowerCase()
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/layouts-config.ts

```typescript
import { addComponentsDir, addLayout } from '@nuxt/kit'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/**
 * Configure misebox layouts for the Nuxt application
 * @param resolver The resolver instance to resolve file paths
 * @param nuxt The Nuxt instance
 */
export function configureLayouts(resolver: any, _nuxt: any) {
  const layoutsDir = resolver.resolve('./runtime/layouts')
  if (!existsSync(layoutsDir)) return

  // Register layouts as components for direct use
  addComponentsDir({
    path: layoutsDir,
    pattern: '*.vue',
    global: true,
    pathPrefix: false,
  })

  // Optionally register as Nuxt layout keys
  for (const key of ['MiseboxDefault', 'MiseboxDashboard', 'MiseboxDev']) {
    const f = join(layoutsDir, `${key}.vue`)
    if (existsSync(f))
      addLayout({ src: f, filename: `misebox-${key}.vue` }, key)
  }
}
```

### /Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/tenants/fireux-misebox/src/config/runtime-config.ts

```typescript
export function configureRuntime(
  nuxt: any,
  key: string,
  defaults: Record<string, any> = { enabled: true }
) {
  const rc = (nuxt.options.runtimeConfig ||= {})
  const pub = (rc.public ||= {})
  if (!pub.fireux) pub.fireux = {}
  const ns = pub.fireux as Record<string, any>
  ns[key] ||= defaults
}
```
