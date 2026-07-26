// FireUX app config guide: packages/core/fireux-docs/src/config/app/nuxt.config.md
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  databaseId: 'buenohost',
  role: 'global',
  seo: {
    siteUrl: 'https://buenohost-app.web.app',
  },
  consoles: ['property'],
  domains: ['properties'],
  modules: ['fireux-properties', 'fireux-reservations'],
})
