import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'
import { configurePages } from 'fireux-core/config/base/pages-config'

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

    // Ensure runtime config buckets exist
    nuxt.options.runtimeConfig.ecosystemController =
      nuxt.options.runtimeConfig.ecosystemController || {}
    nuxt.options.runtimeConfig.public.ecosystemController =
      nuxt.options.runtimeConfig.public.ecosystemController || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Layer runtime pages (e.g., /apps)
    configurePages(resolver, nuxt)

    // Example: expose runtime directory via alias for server routes/plugins
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#fireux-ecosystem-controller'] =
        resolver.resolve('./runtime')
    })
  },
})
