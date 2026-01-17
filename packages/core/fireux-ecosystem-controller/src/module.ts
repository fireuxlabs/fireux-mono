import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'
import type {} from 'nuxt/schema'
import {
  ensureRuntimeConfigBuckets,
  ensureRuntimeLayerFromPath,
  exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'


declare module 'nuxt/schema' {
  interface NuxtConfig {
    ecosystemController?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    ecosystemController?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-ecosystem-controller',
    configKey: 'ecosystemController',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = resolver.resolve('./runtime')

    ensureRuntimeConfigBuckets(nuxt, 'ecosystemController')

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Layer runtime pages (e.g., /apps)
    ensureRuntimeLayerFromPath(nuxt, runtimeDir)

    exposeRuntimeAlias(nuxt, '#fireux-ecosystem-controller', runtimeDir)
  },
})
