import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  role: 'tenant',
  selfJoinEnabled: true,
  subscriptionCapacity: {
    'marketplace-store.team': { free: 3, premium: 7, business: null },
  },
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  modules: [
    [
      'fireux-blogs',
      {
        languages: ['gsw', 'de', 'en'],
        defaultLanguage: 'gsw',
        selectionCookie: 'interlaken-essen.sproochli',
        queryParameter: 'sproochli',
      },
    ],
    'fireux-sproochli',
    'fireux-marketplace',
    ['fireux-suppliers', { mode: 'consumer' }],
    'fireux-places',
    'fireux-companies',
    [
      'fireux-jobs',
      {
        categories: ['hospitality'],
      },
    ],
  ],
  seo: {
    siteUrl: 'https://interlaken-essen.misebox.app',
    noindexPaths: ['/mis', '/mis/**'],
  },
})
