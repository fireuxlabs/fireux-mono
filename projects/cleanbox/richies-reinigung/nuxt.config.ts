import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineNuxtConfig(
  defineFireuxConfig({
    ecosystem: 'cleanbox',
    id: 'richies-reinigung',
    name: 'Richies',
    shortName: 'Richies',
    description:
      'Freelance cleaning partner for Zürich apartments, studios, and office loops.',
    role: 'tenant',
    modules: [
      // tenant stays lean
    ],
  })
)
