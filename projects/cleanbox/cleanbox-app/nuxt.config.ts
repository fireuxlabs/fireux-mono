import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/fireux.config'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'cleanbox',
    id: 'cleanbox-app',
    name: 'Cleanbox',
    shortName: 'Cleanbox',
    description: 'Operations console for Cleanbox partners and teams.',
    role: 'global',
    modules: [
      'fireux-products',
      'fireux-blogs',
    ],
  })
)
