import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'lifeguard-community',
  name: 'Lifeguard Community',
  shortName: 'Lifeguard Community',
  role: 'tenant',
  seo: {
    staticPaths: ['/forum', '/training', '/merchandise'],
    noindexPaths: ['/member', '/member/**'],
  },
})
