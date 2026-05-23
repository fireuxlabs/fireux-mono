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
  },
  modules: ['fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
