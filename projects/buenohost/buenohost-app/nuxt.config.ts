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
  workspaces: ['property'],
  subscriptionCapacity: {
    property: { free: 1, premium: 1, business: null },
    'property.team': { free: 3, premium: 7, business: null },
  },
  domains: ['properties'],
})
