import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-blank',
  name: 'FireUX Blank',
  shortName: 'Blank',
  databaseId: 'fireux',
  role: 'standalone',
  workspaces: ['blank'],
  subscriptionCapacity: {
    blank: { free: 1, premium: 1, business: null },
    'blank.team': { free: 3, premium: 7, business: null },
  },
  seo: {
    noindexPaths: ['/workspace', '/workspace/**'],
  },
})
