import { defineNuxtModule, installModule } from '@nuxt/kit'

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: 'fireux-docs',
    configKey: 'fireuxDocs',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  async setup(options) {
    if (options.enabled === false) return

    await installModule('@nuxt/content')
  },
})
