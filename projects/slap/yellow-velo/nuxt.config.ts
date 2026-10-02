import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  extends: ['fireux-core/layer', 'fireux-slap/layer', 'fireux-blogs/layer', 'fireux-products/layer'],
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'yellow-velo',
  name: 'Yellow Velo',
  shortName: 'Yellow Velo',
  role: 'tenant',
  modules: ['fireux-products'],
  seo: {
    staticPaths: ['/products', '/blog'],
    noindexPaths: ['/workspace', '/workspace/**', '/admin', '/admin/**'],
  },
})
