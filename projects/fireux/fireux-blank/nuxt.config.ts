import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer'],
  modules: ['fireux-bookings'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-blank',
  context:
    'FireUX Blank is a working reference App for exploring Workspace selection, records and shared capabilities without an industry-specific business domain.',
  name: 'FireUX Blank',
  shortName: 'Blank',
  databaseId: 'fireux',
  role: 'standalone',
  workspaces: ['blank'],
  subscriptionCapacity: {
    blank: { free: 1, pro: 1, business: null },
    'blank.team': { free: 3, pro: 7, business: null },
  },
  seo: {
    noindexPaths: ['/workspace', '/workspace/**', '/sandbox/**'],
  },
})
