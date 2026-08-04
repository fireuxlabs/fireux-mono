import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'buenohost',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  role: 'global',
  seo: {
    siteUrl: 'https://buenohost-app.web.app',
  },
  consoles: ['property'],
  domains: ['properties'],
  modules: ['fireux-properties', 'fireux-reservations'],
})
