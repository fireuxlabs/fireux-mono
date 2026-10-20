import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'fireux-blank',
  context: "FireUX Blank is a working reference App for exploring Workspace selection, records and shared capabilities without an industry-specific business domain.",
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
