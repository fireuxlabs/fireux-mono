import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'qrdoc',
  name: 'QRdocs',
  shortName: 'QRdocs',
  databaseId: 'qrdoc',
  meta: metaContent,
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://qrdocs.web.app',
    staticPaths: [
      '/food-menu',
      '/pricing',
      '/terms',
      '/privacy',
      '/help',
    ],
    noindexPaths: [
      '/console',
      '/console/**',
      '/admin',
      '/admin/**',
      '/docs',
      '/docs/**',
    ],
  },
  modules: [],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
