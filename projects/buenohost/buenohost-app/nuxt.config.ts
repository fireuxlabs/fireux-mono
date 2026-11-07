import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'buenohost',
  context:
    'BuenoHost combines public accommodation discovery with Property management. Published property information and recorded reservations do not by themselves guarantee availability.',
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  role: 'global',
  homePath: '/home',
  seo: {
    staticPaths: ['/home'],
    noindexPaths: ['/'],
    siteUrl: 'https://buenohost-app.web.app',
  },
  workspaces: ['property'],
  extends: ['fireux-core/layer', 'fireux-buenohost/property-layer'],
  subscriptionCapacity: {
    property: { free: 1, pro: 1, business: null },
    'property.team': { free: 3, pro: 7, business: null },
  },
  domains: ['properties'],
})
