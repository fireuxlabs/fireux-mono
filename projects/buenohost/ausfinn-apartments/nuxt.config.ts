import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'ausfinn-apartments',
  name: 'AUSFinn Apartments',
  shortName: 'AUSFinn',
  role: 'tenant',
  seo: {
    siteUrl: 'https://ausfinn-apartments.web.app',
  },
  workspaces: ['property'],
  subscriptionCapacity: {
    property: { free: 1, premium: 1, business: null },
    'property.team': { free: 3, premium: 7, business: null },
  },
  workspaceConfig: {
    property: {
      canCreate: false,
    },
  },
  domains: ['properties'],
})
