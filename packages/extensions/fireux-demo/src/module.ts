import { defineNuxtModule } from '@nuxt/kit'

/** Explicit-import-only Demo contracts; this module registers no runtime surface. */
export default defineNuxtModule({
  meta: {
    name: 'fireux-demo',
    version: '0.1.0',
    configKey: 'fireuxDemo',
    compatibility: { nuxt: '^4.4.0' },
  },
})
