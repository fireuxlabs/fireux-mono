import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'richies-reinigung',
  name: 'Richies',
  shortName: 'Richies',
  role: 'tenant',
  consoleFamilies: [],
  modules: [
    // tenant stays lean
  ],
})

export default defineNuxtConfig(fireuxConfig)
