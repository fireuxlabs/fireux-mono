import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'book-with-nats',
  name: 'Book with Nats',
  shortName: 'Nats',
  databaseId: 'buenohost',
  role: 'tenant',
  seo: {
    siteUrl: 'https://book-with-nats-buenohost.web.app',
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
