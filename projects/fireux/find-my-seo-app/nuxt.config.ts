import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'find-my-seo-app',
  name: 'Find My SEO',
  shortName: 'FindMySEO',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: [],
  modules: [],
})

export default defineNuxtConfig(fireuxConfig)
