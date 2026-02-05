import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureComponents } from './config/module/components-config'
import { configureComposables } from './config/module/composables-config'
import { configureLayouts } from './config/module/layouts-config'
import { configureModels } from './config/module/models-config'
import { configurePages } from './config/module/pages-config'
import { configurePlugins } from './config/module/plugins-config'
import { configureRuntime } from './config/module/runtime-config'
import { configureServer } from './config/module/server-config'
import { exposeRuntimeAlias } from 'fireux-core/config/module/runtime-layer'

export interface ModuleOptions {
  prefix?: string
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    fireuxKitchens?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    fireuxKitchens?: Partial<ModuleOptions>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'fireux-kitchens',
    version: '0.1.0',
    configKey: 'fireuxKitchens',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults: {
    prefix: 'Fire',
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    configureRuntime(nuxt, 'kitchens')
    configurePlugins(resolver)
    configureComposables(resolver)
    configureComponents(resolver)
    configureLayouts(resolver, nuxt)
    configureModels(resolver)
    configurePages(resolver, nuxt)
    configureServer(resolver)

    exposeRuntimeAlias(nuxt, '#fireux-kitchens', runtimeDir)
  },
})
