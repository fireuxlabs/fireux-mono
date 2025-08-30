# FireUX Core Module Configuration

## Main Module File

### `packages/core/fireux-core/src/module.ts`

```typescript
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

import { configureComponents } from './config/components-config'
import { configureComposables } from './config/composables-config'
import { configureModels } from './config/models-config'
import { configurePages } from './config/pages-config'
import { configurePlugins } from './config/plugins-config'
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

## Configuration Files

### `src/config/components-config.ts`

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

### `src/config/composables-config.ts`

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureComposables(resolver: any) {
  // Auto-import composables under runtime/composables/**
  addImportsDir(resolver.resolve('../runtime/composables'))
}
```

### `src/config/models-config.ts`

```typescript
import { addImportsDir } from '@nuxt/kit'

export function configureModels(resolver: any, _nuxt: any) {
  // Allow importing model helpers/types from runtime/models/** (where it makes sense)
  addImportsDir(resolver.resolve('../runtime/models'))
}
```

### `src/config/pages-config.ts`

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

### `src/config/plugins-config.ts`

```typescript
import { addPlugin } from '@nuxt/kit'

export function configurePlugins(resolver: any) {
  // Client/runtime plugin example; add more as needed
  const maybeClient = resolver.resolve('../runtime/plugins/firebase.client.ts')
  addPlugin({ src: maybeClient, mode: 'client' })
}
```

### `src/config/server-config.ts`

```typescript
import { addServerHandler } from '@nuxt/kit'

export function configureServer(resolver: any) {
  // Wire up a few server routes (adjust to your actual file names)
  const base = resolver.resolve('../runtime/server/api')

  addServerHandler({ route: '/api/app', handler: `${base}/app.get.ts` })
  // Add more handlers here as you bring routes online
}
```

### `src/config/runtime-config.ts`

```typescript
export function configureRuntime(nuxt: any) {
  // Augment runtime config namespaces used by this module
  nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {}
  nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
  nuxt.options.runtimeConfig.public.fireux =
    nuxt.options.runtimeConfig.public.fireux || {}
  nuxt.options.runtimeConfig.public.fireux.core = nuxt.options.runtimeConfig
    .public.fireux.core || { enabled: true }
}
```

## Summary

The FireUX core module is organized with:

- **Main module file** (`module.ts`): Orchestrates all configuration steps
- **7 configuration functions**: Each handling a specific aspect of module setup
  1. **Components**: Auto-registers Vue components with prefix
  2. **Composables**: Auto-imports composables for use without imports
  3. **Models**: Makes model types available for auto-import
  4. **Pages**: Registers module pages via Nuxt layers
  5. **Plugins**: Adds client-side Firebase plugin
  6. **Server**: Registers server API handlers
  7. **Runtime**: Sets up runtime configuration namespaces

All files are minimal, focused stubs that can be expanded as needed while maintaining clean separation of concerns.
