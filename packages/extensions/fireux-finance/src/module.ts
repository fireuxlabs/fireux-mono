import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureComponents } from './config/module/components-config'

export default defineNuxtModule({
  meta: {
    name: 'fireux-finance',
    version: '0.1.0',
    configKey: 'fireuxFinance',
    compatibility: { nuxt: '^4.4.0' },
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    configureComponents(resolver)
  },
})
