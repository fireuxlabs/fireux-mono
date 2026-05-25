// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  databaseId: 'buenohost',
  role: 'standalone',
  consoles: ['property'],
  domains: ['properties'],
  seo: {
    siteUrl: 'https://buenohost.web.app',
  },
  modules: ['fireux-properties', 'fireux-products', 'fireux-blogs'],
})
