import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { interlakenEssenAuthConfig } from './app/config/auth.config'

export default defineFireuxConfig({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'interlaken-essen',
  name: 'Interlaken Essen',
  shortName: 'Interlaken Essen',
  role: 'tenant',
  selfJoinEnabled: true,
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
  ...interlakenEssenAuthConfig,
  seo: {
    siteUrl: 'https://interlaken-essen.misebox.app',
    noindexPaths: ['/mis', '/mis/**'],
  },
})
