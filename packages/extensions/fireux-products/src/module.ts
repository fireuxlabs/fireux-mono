import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'

declare module 'nuxt/schema' {
  interface NuxtConfig { products?: Partial<typeof defaults> }
  interface NuxtOptions { products?: Partial<typeof defaults> }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-products',
    configKey: 'products',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ensure runtime config buckets exist
    nuxt.options.runtimeConfig.products = nuxt.options.runtimeConfig.products || {}
    nuxt.options.runtimeConfig.public.products =
      nuxt.options.runtimeConfig.public.products || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Example: expose runtime directory via alias for server routes/plugins
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#fireux-products'] = resolver.resolve('./runtime')
    })
  },
})
