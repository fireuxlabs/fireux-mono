import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'find-my-seo-app',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  databaseId: 'find-my-seo',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: [],
  seo: {
    siteUrl: 'https://find-my-seo.web.app',
  },
  modules: [],
})

export default defineNuxtConfig(fireuxConfig)
