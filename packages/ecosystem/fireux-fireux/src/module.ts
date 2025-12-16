import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'fireux-fireux',
    version: '0.1.0',
    configKey: 'fireuxFireux',
  },

  setup() {
    // Token log so we can see the ecosystem module loaded
    console.info('[fireux-fireux] hello')
  },
})
