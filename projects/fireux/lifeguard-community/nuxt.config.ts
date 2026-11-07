import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'lifeguard-community',
  context:
    'Lifeguard Community provides a place for member discussion and extracurricular learning. Community material should remain distinguishable from official qualifications or accredited training.',
  name: 'Lifeguard Community',
  shortName: 'Lifeguard Community',
  databaseId: 'lifeguard-community',
  role: 'standalone',
  seo: {
    staticPaths: ['/forum', '/training', '/merchandise'],
    noindexPaths: ['/member', '/member/**'],
  },
})
