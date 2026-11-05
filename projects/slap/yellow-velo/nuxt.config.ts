import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'slap',
  extends: ['fireux-core/layer', 'fireux-slap/layer'],
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'yellow-velo',
  context:
    'Yellow Velo represents an independent bike shop in Interlaken. Its App brings together the shop’s identity, cycling-related content and product presentation.',
  name: 'Yellow Velo',
  shortName: 'Yellow Velo',
  role: 'tenant',
  seo: {
    staticPaths: ['/products', '/blog'],
    noindexPaths: ['/workspace', '/workspace/**', '/admin', '/admin/**'],
  },
})
