import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'ausfinn-apartments',
  context:
    'AUSFinn Apartments presents apartments, houses and an alpine villa around Interlaken, Unterseen, Ringgenberg and Bönigen. Each property retains its own accommodation information.',
  name: 'AUSFinn Apartments',
  shortName: 'AUSFinn',
  role: 'tenant',
  seo: {
    siteUrl: 'https://ausfinn-apartments.web.app',
  },
  workspaces: ['property'],
  extends: ['fireux-core/layer', 'fireux-buenohost/property-layer'],
  subscriptionCapacity: {
    property: { free: 1, pro: 1, business: null },
    'property.team': { free: 3, pro: 7, business: null },
  },
  workspaceConfig: {
    property: {
      canCreate: false,
    },
  },
  domains: ['properties'],
})
