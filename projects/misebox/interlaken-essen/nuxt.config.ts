import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  context:
    'Interlaken Essen is a local food-discovery App. Its experience centres on locality, food offers and introductions that help people find relevant places to eat.',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  role: 'tenant',
  subscriptionCapacity: {
    'marketplace-store.team': { free: 3, pro: 7, business: null },
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
    'fireux-businesses',
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
  extends: [
    'fireux-core/layer',
    'fireux-places/layer',
    'fireux-businesses/layer',
    'fireux-jobs/layer',
  ],
})
