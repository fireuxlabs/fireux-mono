// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'yellow-velo',
  name: 'Yellow Velo',
  shortName: 'Yellow Velo',
  databaseId: 'slap',
  role: 'tenant',
  seo: {
    staticPaths: ['/', '/products', '/blog'],
    noindexPaths: ['/console', '/console/**', '/admin', '/admin/**'],
  },
})
