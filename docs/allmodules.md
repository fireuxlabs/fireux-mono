# All Nuxt Modules (module.ts)

This document aggregates all package Nuxt modules (`src/module.ts`) for quick review and copy/paste.

## packages/core/fireux-core/src/module.ts

```typescript
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
    configureServer(resolver)

    // 8) assets
    configureAssets(resolver, nuxt)

    // 9) errors
    configureErrors(resolver, nuxt)
  },
})

export default module
export { createFireuxConfig } from './runtime/utils/fireux-config'
```

## packages/extensions/fireux-jobs/src/module.ts

```typescript
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-jobs',
    version: '1.0.0',
    configKey: 'fireuxJobs',
  },
  defaults: { prefix: 'Fire' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    await installModule('fireux-core')
    configureRuntime(nuxt, 'jobs')
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-jobs: module configured')
    })
  },
})

export default module
```

## packages/extensions/fireux-places/src/module.ts

```typescript
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

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
    await installModule('fireux-core')

    configureRuntime(nuxt, 'places')
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver, options)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-places: module configured')
    })
  },
})

export default module
```

## packages/tenants/fireux-misebox/src/module.ts

```typescript
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

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

    await installModule('fireux-core')
    // Include jobs extension across all Misebox apps (professionals/employers routes, components, composables)
    await installModule('fireux-jobs')

    configureRuntime(nuxt, 'misebox')
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-misebox: module configured')
    })
  },
})

export default module
```

## packages/tenants/fireux-cleanbox/src/module.ts

```typescript
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

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

    await installModule('fireux-core')

    configureRuntime(nuxt, 'cleanbox')
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-cleanbox: module configured')
    })
  },
})

export default module
```

## packages/tenants/fireux-fireux/src/module.ts

```typescript
import { defineNuxtModule, installModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import { configureRuntime } from './config/runtime-config'
import { configurePlugins } from './config/plugins-config'
import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureLayouts } from './config/layouts-config'
import { configurePages } from './config/pages-config'

export interface ModuleOptions {
  prefix?: string
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: { name: 'fireux-fireux', version: '0.1.0', configKey: 'fireuxFireux' },
  defaults: { prefix: 'Fireux' },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Install core dependency
    await installModule('fireux-core')

    configureRuntime(nuxt, 'fireux')
    configurePlugins(resolver)
    configureComponents(resolver, options)
    configureComposables(resolver)
    configureLayouts(resolver, nuxt)
    configurePages(resolver, nuxt)
    // configureServer(resolver) // toggle as needed

    nuxt.hook('ready', () => {
      console.log('fireux-fireux: module configured')
    })
  },
})

export default module
```
