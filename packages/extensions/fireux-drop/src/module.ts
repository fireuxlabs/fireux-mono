import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'

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
    nuxt.options.runtimeConfig.drop = nuxt.options.runtimeConfig.drop || {}
    nuxt.options.runtimeConfig.public.drop =
      nuxt.options.runtimeConfig.public.drop || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Example: expose runtime directory via alias for server routes/plugins
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#fireux-drop'] = resolver.resolve('./runtime')
    })
  },
})
