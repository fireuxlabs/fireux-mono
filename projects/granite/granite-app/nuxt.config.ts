import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'
import { graniteNuxtOverrides } from './app/config/vite.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'granite',
  projectId: 'granite',
  ecosystemId: 'granite',
  id: 'granite-app',
  name: 'Granite',
  shortName: 'Granite',
  role: 'global',
  consoles: ['portfolio'],
  domains: ['properties', 'portfolios'],
  modules: [
    'fireux-properties',
    'fireux-compliance',
    'fireux-documents',
    'fireux-tasks',
  ],
})

export default withFireuxNuxtConfig(fireuxConfig, graniteNuxtOverrides)
