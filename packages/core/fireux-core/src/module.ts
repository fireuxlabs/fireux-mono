import { defineNuxtModule } from '@nuxt/kit'

import { ecosystemConfig } from '../config/ecosystem.config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
    configKey: 'fireuxFireux',
  },

  setup(_options, nuxt) {
    // Token so you can see the ecosystem module definitely loaded
    console.info('[fireux-fireux] hello')

    // The ecosystem module owns ecosystem-level config.
    // Core reads this from `runtimeConfig.public.ecosystem`.
    const rc = ((nuxt.options.runtimeConfig ||= {}) as any)
    const pub = ((rc.public ||= {}) as any)

    pub.ecosystem = ecosystemConfig

    console.info('[fireux-fireux] ecosystem.id =', ecosystemConfig.id)
  },
})
