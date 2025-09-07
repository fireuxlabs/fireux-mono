# Module files inventory and alignment

This document lists the contents of every `module.ts` in the repo and notes the temporary change to disable server registration to help isolate the impound error. The line `configureServer(resolver)` is commented out in each module below.

## packages/core/fireux-core/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'
import { configureServer } from './config/server-config'
import { configureAssets } from './config/assets-config'
import { configureErrors } from './config/errors-config'

const module: NuxtModule = defineNuxtModule({
  meta: { name: 'fireux-core', version: '1.0.0', configKey: 'fireuxCore' },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1) runtime first
    configureRuntime(nuxt, 'core')

    // 2) plugins (can read runtime)
    configurePlugins(resolver)

    // 3) components
    configureComponents(resolver)

    // 4) composables
    configureComposables(resolver)

    // 5) layouts
    configureLayouts(resolver, nuxt)

    // 6) pages
    configurePages(resolver, nuxt)

    // 7) server (api/middleware)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)

    // 8) assets
    configureAssets(resolver, nuxt)

    // 9) errors
    configureErrors(resolver, nuxt)
  },
})

export default module
export { createFireuxConfig } from './runtime/utils/fireux-config'
```

## packages/extensions/fireux-places/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'
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
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Delegate to config functions
    configureComponents(resolver, options)
    configureComposables(resolver, options)
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)
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

## packages/extensions/fireux-jobs/src/module.ts

```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
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
    configurePages(resolver, nuxt)
    configurePlugins(resolver)
    configureLayouts(resolver, nuxt)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)
    configureRuntime(nuxt, 'jobs')
    // Safe nitro tweak
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true
  },
})
```

## packages/tenants/fireux-misebox/src/module.ts

```ts
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
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
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)
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
```

## packages/tenants/fireux-cleanbox/src/module.ts

```ts
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
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
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)
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
```

## packages/tenants/fireux-fireux/src/module.ts

```ts
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configurePages } from './config/pages-config'
import { configureLayouts } from './config/layouts-config'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureServer } from './config/server-config'

export interface ModuleOptions {
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: { name: 'fireux-fireux', version: '0.1.0', configKey: 'fireuxFireux' },
  defaults: { prefix: 'Fireux' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    // Delegate to config functions (no-op scaffolds for now)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configurePages(resolver, nuxt)
    configureLayouts(resolver, nuxt)
    configurePlugins(resolver)
    // TEMP: disabled while investigating impound error
    // configureServer(resolver)
    configureRuntime(nuxt, 'fireux')

    // Nitro tweak for parity
    nuxt.options.nitro ||= {}
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.wasm = true

    nuxt.hook('ready', () => {
      // eslint-disable-next-line no-console
      console.log('fireux-fireux: module configured')
    })
  },
})
```

## Notes on alignment

- Consistent import grouping and call order are used across modules.
- `configureServer(resolver)` is commented out in all modules to temporarily disable server registration while we investigate the impound error.
- Nitro experimental WASM tweak is standardized where present.
