import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'lifeguard-community',
  name: 'Lifeguard Community',
  shortName: 'Lifeguard Community',
  databaseId: 'lifeguard-community',
  role: 'standalone',
  seo: {
    staticPaths: ['/forum', '/training', '/merchandise'],
    noindexPaths: ['/member', '/member/**'],
  },
})
