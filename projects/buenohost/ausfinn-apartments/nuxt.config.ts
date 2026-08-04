import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'ausfinn-apartments',
  name: 'AUSFinn Apartments',
  shortName: 'AUSFinn',
  databaseId: 'buenohost',
  role: 'tenant',
  seo: {
    siteUrl: 'https://ausfinn-apartments.web.app',
  },
  consoles: ['property'],
  consoleConfig: {
    property: {
      canCreate: false,
    },
  },
  domains: ['properties'],
  modules: ['fireux-properties', 'fireux-reservations'],
  navHiddenKeys: ['properties'],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
})
