import {
  addServerImportsDir,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'fireux-bookings',
    version: '0.1.0',
    compatibility: { nuxt: '^4.4.0' },
  },
  setup() {
    const resolver = createResolver(import.meta.url)
    addServerImportsDir(resolver.resolve('./runtime/server'))
  },
})
