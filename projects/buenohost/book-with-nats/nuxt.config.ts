import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'buenohost',
  projectId: 'fireux',
  ecosystemId: 'buenohost',
  id: 'book-with-nats',
  context:
    'Book with Nats presents a private Swiss alpine stay through a personal hospitality experience. Property details and booking arrangements belong to the particular stay.',
  name: 'Book with Nats',
  shortName: 'Nats',
  role: 'tenant',
  seo: {
    siteUrl: 'https://book-with-nats-buenohost.web.app',
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
