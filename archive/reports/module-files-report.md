# Module Files Comparison Report

Date: 2025-08-30

This report lists all `module.ts` files in the monorepo with their full contents for quick comparison.

---

## packages/core/fireux-core/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'
import { configureRuntime } from './config/runtime-config.ts'

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
    configureServer(resolver)
    configureRuntime(nuxt)

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

---

## packages/extensions/fireux-jobs/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
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
    configureServer(resolver)
    configureRuntime(nuxt)
    // Safe nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true
  },
})
```

---

## packages/extensions/fireux-places/src/module.ts

```ts
import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addPlugin,
} from '@nuxt/kit'
import { existsSync } from 'node:fs'

export default defineNuxtModule({
  meta: {
    name: 'fireux-places',
    version: '0.1.0',
    configKey: 'fireuxPlaces',
  },
  defaults: {
    prefix: 'Fire',
  },
  setup(options, nuxt) {
    const r = createResolver(import.meta.url)

    // Components
    const compsDir = r.resolve('./runtime/components')
    if (existsSync(compsDir)) {
      addComponentsDir({
        path: compsDir,
        prefix: options.prefix || 'Fire',
        global: false,
        pathPrefix: false,
      })
    }

    // Composables
    const compoDir = r.resolve('./runtime/composables')
    if (existsSync(compoDir)) addImportsDir(compoDir)

    // Models
    const modelsDir = r.resolve('./runtime/models')
    if (existsSync(modelsDir)) addImportsDir(modelsDir)

    // Plugins
    const pluginClient = r.resolve('./runtime/plugins/firebase.client.ts')
    if (existsSync(pluginClient)) {
      addPlugin({ src: pluginClient, mode: 'client' })
    }

    // Runtime config
    const runtimeConfig = nuxt.options.runtimeConfig || { app: {}, public: {} }
    runtimeConfig.public = runtimeConfig.public || {}
    if (runtimeConfig.public.fireux) {
      runtimeConfig.public.fireux.places = { enabled: true }
    } else {
      runtimeConfig.public.fireux = { places: { enabled: true } }
    }
    nuxt.options.runtimeConfig = runtimeConfig

    // Nitro
    if (nuxt.options.nitro) {
      nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
      nuxt.options.nitro.experimental.wasm = true
    }

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-places module configured')
    })
  },
})
```

---

## packages/tenants/fireux-misebox/src/module.ts

```ts
import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addPlugin,
  installModule,
} from '@nuxt/kit'
import { existsSync } from 'node:fs'

export default defineNuxtModule({
  meta: {
    name: 'fireux-misebox',
    version: '0.1.0',
    configKey: 'fireuxMisebox',
  },
  defaults: {
    prefix: 'Mise',
  },
  async setup(options, nuxt) {
    const r = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Components
    const compsDir = r.resolve('./runtime/components')
    if (existsSync(compsDir)) {
      addComponentsDir({
        path: compsDir,
        prefix: options.prefix || 'Mise',
        global: false,
        pathPrefix: false,
      })
    }

    // Composables
    const compoDir = r.resolve('./runtime/composables')
    if (existsSync(compoDir)) addImportsDir(compoDir)

    // Models
    const modelsDir = r.resolve('./runtime/models')
    if (existsSync(modelsDir)) addImportsDir(modelsDir)

    // Plugins
    const pluginClient = r.resolve('./runtime/plugins/firebase.client.ts')
    if (existsSync(pluginClient)) {
      addPlugin({ src: pluginClient, mode: 'client' })
    }

    // Runtime config (augment public.fireux.misebox safely)
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {}
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    const pub = nuxt.options.runtimeConfig.public as any
    if (!pub.fireux) pub.fireux = {}
    pub.fireux.misebox = { enabled: true }

    // Nitro
    if (nuxt.options.nitro) {
      nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
      nuxt.options.nitro.experimental.wasm = true
    }

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-misebox module configured')
    })
  },
})
```

---

## packages/tenants/fireux-cleanbox/src/module.ts

```ts
import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addPlugin,
  installModule,
} from '@nuxt/kit'
import { existsSync } from 'node:fs'

export default defineNuxtModule({
  meta: {
    name: 'fireux-cleanbox',
    version: '0.1.0',
    configKey: 'fireuxCleanbox',
  },
  defaults: {
    prefix: 'Clean',
  },
  async setup(options, nuxt) {
    const r = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Components
    const compsDir = r.resolve('./runtime/components')
    if (existsSync(compsDir)) {
      addComponentsDir({
        path: compsDir,
        prefix: options.prefix || 'Clean',
        global: false,
        pathPrefix: false,
      })
    }

    // Composables
    const compoDir = r.resolve('./runtime/composables')
    if (existsSync(compoDir)) addImportsDir(compoDir)

    // Models
    const modelsDir = r.resolve('./runtime/models')
    if (existsSync(modelsDir)) addImportsDir(modelsDir)

    // Plugins
    const pluginClient = r.resolve('./runtime/plugins/firebase.client.ts')
    if (existsSync(pluginClient)) {
      addPlugin({ src: pluginClient, mode: 'client' })
    }

    // Runtime config
    const runtimeConfig = nuxt.options.runtimeConfig || { app: {}, public: {} }
    runtimeConfig.public = runtimeConfig.public || {}
    if (runtimeConfig.public.fireux) {
      runtimeConfig.public.fireux.cleanbox = { enabled: true }
    } else {
      runtimeConfig.public.fireux = { cleanbox: { enabled: true } }
    }
    nuxt.options.runtimeConfig = runtimeConfig

    // Nitro
    if (nuxt.options.nitro) {
      nuxt.options.nitro.experimental = nuxt.options.nitro.experimental || {}
      nuxt.options.nitro.experimental.wasm = true
    }

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-cleanbox module configured')
    })
  },
})
```
