import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { defineNuxtConfig } from 'nuxt/config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'sproochli',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  consoles: [],
  seo: {
    siteUrl: 'https://sproochli.web.app',
  },
  modules: ['fireux-sproochli', 'fireux-products', 'fireux-blogs'],
})

export default defineNuxtConfig({
  ...fireuxConfig,
})
