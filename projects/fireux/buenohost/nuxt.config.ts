import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  databaseId: 'buenohost',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: ['bnb'],
  seo: {
    siteUrl: 'https://buenohost.web.app',
  },
  modules: [],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
