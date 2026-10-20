import { defineFireuxConfig, type FireuxAppConfig } from 'fireux-core/config/app/fireux.config'

const app: FireuxAppConfig = {
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  context: "Interlaken Essen is a local food-discovery App. Its experience centres on locality, food offers and introductions that help people find relevant places to eat.",
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
}

export default {
  ...defineFireuxConfig(app),
  extends: [
    ...(app.workspaces?.includes('kitchen')
      ? ['fireux-kitchens/layer', 'fireux-misebox/layer']
      : []),
    'fireux-core/layer',
    'fireux-blogs/layer',
    'fireux-places/layer',
    'fireux-companies/layer',
    'fireux-jobs/layer',
  ],
}
