// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  id: 'yellow-velo',
  name: 'Yellow Velo',
  shortName: 'Yellow Velo',
  databaseId: 'slap',
  role: 'tenant',
  consoles: [],
  seo: {
    siteUrl: 'https://yellowvelo.web.app',
    staticPaths: [
      '/',
      '/bikes',
      '/merch',
      '/products',
      '/blog',
    ],
    noindexPaths: [
      '/console',
      '/console/**',
      '/admin',
      '/admin/**',
    ],
  },
  modules: ['fireux-products', 'fireux-blogs'],
})
