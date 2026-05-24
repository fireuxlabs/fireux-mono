import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'go-qr',
  name: 'Go QR',
  shortName: 'Go QR',
  databaseId: 'go-qr',
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://go-qr.web.app',
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
  modules: ['fireux-products'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
