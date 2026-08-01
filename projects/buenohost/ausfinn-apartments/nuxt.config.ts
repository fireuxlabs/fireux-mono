import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'
import { withFireuxNuxtConfig } from 'fireux-core/config/app/nuxt-overrides'

const propertyTargetIds = [
  'ringgenberg-studio',
  'ringgenberg-first-floor',
  'ringgenberg-ground-floor',
  'riverside-unterseen-one',
  'riverside-unterseen-two',
  'garden-house',
  'riverside-town-house',
  'big-family-castle-house',
  'alpine-guest-house',
] as const

const fireuxConfig = defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'ausfinn-apartments',
  name: 'AUSFinn Apartments',
  shortName: 'AUSFinn',
  brand: { owner: 'app', status: 'provisional' },
  databaseId: 'buenohost',
  role: 'tenant',
  seo: {
    siteUrl: 'https://ausfinn-apartments.web.app',
  },
  consoles: ['property'],
  consoleConfig: {
    property: {
      canCreate: false,
      targetIds: [...propertyTargetIds],
    },
  },
  domains: ['properties'],
  modules: ['fireux-properties', 'fireux-reservations'],
  navHiddenKeys: ['properties'],
})

export default withFireuxNuxtConfig(fireuxConfig, {
  css: ['@/assets/styles/main.css'],
  ssr: false,
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: false,
      routes: ['/', '/stays', '/book', '/contact'],
    },
  },
})
