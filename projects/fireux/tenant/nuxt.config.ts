import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'fireux-tenant',
  name: 'FireUX Tenant',
  shortName: 'Tenant',
  role: 'tenant',
  consoleFamilies: [],
  seo: {
    siteUrl: 'https://tennant.web.app',
  },
  modules: [],
})

export default defineNuxtConfig(fireuxConfig)
