import { ensureRuntimeConfigBuckets, exposeRuntimeAlias } from 'fireux-core/config/module/runtime-layer'
import { addImportsDir, createResolver, defineNuxtModule } from 'nuxt/kit'
import type { } from 'nuxt/schema'

declare module 'nuxt/schema' {
  interface NuxtConfig { drop?: Partial<typeof defaults> }
  interface NuxtOptions { drop?: Partial<typeof defaults> }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-drop',
    configKey: 'drop',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ensure runtime config buckets exist
    ensureRuntimeConfigBuckets(nuxt as any, 'drop')

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Example: expose runtime directory via alias for server routes/plugins
    exposeRuntimeAlias(nuxt as any, '#fireux-drop', resolver.resolve('./runtime'))
  },
})
