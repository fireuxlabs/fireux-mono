// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
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
  pricing: {
    consoleName: 'Portfolio Console',
    free: [
      'Use one Portfolio workspace',
      'Record properties and clients',
      'Use the Portfolio Console',
      'Review the current portfolio structure',
    ],
    pro: [
      'Manage portfolios, properties, and clients',
      'Track compliance, incidents, documents, and tasks',
      'Review portfolio financial signals',
      'Give the portfolio team Console access',
    ],
  },
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
