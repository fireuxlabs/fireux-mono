import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'
import type {} from 'nuxt/schema'
import {
  ensureRuntimeConfigBuckets,
  ensureRuntimeLayer,
  exposeRuntimeAlias,
} from 'fireux-core/config/nuxt/nuxt-runtime-layer'


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
    ensureRuntimeLayer(nuxt, runtimeDir)

    exposeRuntimeAlias(nuxt, '#fireux-ecosystem-controller', runtimeDir)
  },
})
