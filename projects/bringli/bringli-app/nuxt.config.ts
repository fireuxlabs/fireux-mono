// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'bringli',
  projectId: 'bringli',
  ecosystemId: 'bringli',
  id: 'bringli-app',
  name: 'Bringli',
  shortName: 'Bringli',
  brand: { owner: 'app', status: 'provisional' },
  role: 'global',
  pricing: {
    consoleName: 'Supply Console',
    free: ['Create a supplier profile', 'Publish basic supplier information', 'Use the Supplier Console', 'Review catalogue, ingredient, and item records'],
    pro: ['Manage complete supplier catalogues', 'Connect ingredients and supplied items', 'Coordinate coverage and delivery work', 'Give the supply team Console access'],
  },
  consoles: ['supplier'],
  domains: ['suppliers'],
  modules: ['fireux-suppliers'],
})
