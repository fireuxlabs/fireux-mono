import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Cleanbox',
  shortName: 'Cleanbox',
  role: 'global',
  consoleFamilies: [],
  modules: ['fireux-jobs', 'fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig(fireuxConfig)
