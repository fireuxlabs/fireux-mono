import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'granite',
  id: 'granite-app',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  modules: [
    'fireux-properties',
    'fireux-compliance',
    'fireux-documents',
    'fireux-tasks',
  ],
})

export default defineNuxtConfig(fireuxConfig)
