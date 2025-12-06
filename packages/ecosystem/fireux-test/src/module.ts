import { defineNuxtModule, createResolver, addComponentsDir } from 'nuxt/kit'

declare module 'nuxt/schema' {
  interface NuxtConfig { test?: Partial<typeof defaults> }
  interface NuxtOptions { test?: Partial<typeof defaults> }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-test',
    configKey: 'test',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeKey = 'test'

    nuxt.options.runtimeConfig[runtimeKey] = nuxt.options.runtimeConfig[runtimeKey] || {}
    nuxt.options.runtimeConfig.public[runtimeKey] =
      nuxt.options.runtimeConfig.public[runtimeKey] || {}

    awaitComponentsDir(resolver)

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        // eslint-disable-next-line no-console
        console.info('fireux-test: ecosystem module configured')
      }
    })
  },
})

function awaitComponentsDir(resolver) {
  addComponentsDir(resolver.resolve('./runtime/components'))
}
