import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'
import { metaContent } from './app/content/meta'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'sproochli',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  meta: metaContent,
  role: 'standalone',
  consoleFamilies: ['bnb'],
  seo: {
    siteUrl: 'https://sproochli.web.app',
  },
  modules: ['fireux-sproochli'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
