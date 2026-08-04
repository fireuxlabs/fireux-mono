import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'yellow-velo',
  name: 'Yellow Velo',
  shortName: 'Yellow Velo',
  role: 'tenant',
  modules: ['fireux-products'],
  seo: {
    staticPaths: ['/products', '/blog'],
    noindexPaths: ['/console', '/console/**', '/admin', '/admin/**'],
  },
})
