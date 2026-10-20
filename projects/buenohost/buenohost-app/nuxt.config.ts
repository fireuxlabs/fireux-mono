import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const workspaces = ['property']

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'buenohost',
  context: "BuenoHost combines public accommodation discovery with Property management. Published property information and recorded reservations do not by themselves guarantee availability.",
  name: 'BuenoHost',
  shortName: 'BuenoHost',
  role: 'global',
  seo: {
    siteUrl: 'https://buenohost-app.web.app',
  },
  workspaces,
  extends: [
    'fireux-core/layer',
    ...(workspaces.includes('property') ? ['fireux-properties/layer', 'fireux-reservations/layer'] : []),
    'fireux-buenohost/layer',
    'fireux-blogs/layer',
  ],
  subscriptionCapacity: {
    property: { free: 1, premium: 1, business: null },
    'property.team': { free: 3, premium: 7, business: null },
  },
  domains: ['properties'],
})
