import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'cleanbox',
    id: 'richies-reinigung',
    name: 'Richies',
    shortName: 'Richies',
    role: 'tenant',
    modules: [
      // tenant stays lean
    ],
  })
)
