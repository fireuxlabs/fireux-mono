import {
  ensureRuntimeConfigBuckets,
  exposeRuntimeAlias,
} from 'fireux-core/config/module/runtime-layer'
import { registerComposablesDir } from 'fireux-core/config/module/module-helpers'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    /** @deprecated Use `fireuxDrop` */
    drop?: Partial<typeof defaults>
    fireuxDrop?: Partial<typeof defaults>
  }
  interface NuxtOptions {
    /** @deprecated Use `fireuxDrop` */
    drop?: Partial<typeof defaults>
    fireuxDrop?: Partial<typeof defaults>
  }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-drop',
    version: '0.1.0',
    configKey: 'fireuxDrop',
    compatibility: { nuxt: '^4.1.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ensure runtime config buckets exist
    ensureRuntimeConfigBuckets(nuxt as any, 'drop')

    // Auto-import runtime composables directory (create files as needed)
    registerComposablesDir(resolver)

    // Example: expose runtime directory via alias for server routes/plugins
    exposeRuntimeAlias(nuxt as any, '#fireux-drop', resolver.resolve('./runtime'))
  },
})
