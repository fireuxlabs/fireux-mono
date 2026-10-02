import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'go-qr',
  name: 'Go QR',
  shortName: 'Go QR',
  databaseId: 'go-qr',
  role: 'standalone',
  modules: ['fireux-go-qr'],
  seo: {
    staticPaths: ['/pricing', '/terms', '/privacy', '/help'],
    noindexPaths: ['/workspace', '/workspace/**', '/admin', '/admin/**'],
  },
})
