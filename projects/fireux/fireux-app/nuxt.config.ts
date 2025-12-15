import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/fireux.config'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'fireux',
    id: 'fireux-app',
    name: 'FireUX',
    shortName: 'FireUX',
    description: 'Core workspace for FireUX platform operations.',
    role: 'global',
    modules: [
      'fireux-products',
      'fireux-blogs',
    ],
  })
)
