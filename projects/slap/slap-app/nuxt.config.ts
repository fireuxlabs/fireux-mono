// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'slap-app',
  name: 'Slap',
  shortName: 'Slap',
  brand: { owner: 'app', status: 'provisional' },
  role: 'global',
  pricing: {
    consoleName: 'Commerce Console',
    free: ['Create one brand workspace', 'Publish products and stories', 'Use the Commerce Console', 'Build the first public brand surface'],
    pro: ['Manage products, collections, and drops', 'Publish stories and gallery content', 'Operate the branded storefront', 'Give the commerce team Console access'],
  },
  databaseId: 'slap',
})
