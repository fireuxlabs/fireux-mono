import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const workspaces = ['property']

export default defineFireuxConfig({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'book-with-nats',
  name: 'Book with Nats',
  shortName: 'Nats',
  role: 'tenant',
  seo: {
    siteUrl: 'https://book-with-nats-buenohost.web.app',
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
  workspaceConfig: {
    property: {
      canCreate: false,
    },
  },
  domains: ['properties'],
})
