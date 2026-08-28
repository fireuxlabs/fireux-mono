import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

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
  workspaces: ['property'],
  workspaceConfig: {
    property: {
      canCreate: false,
    },
  },
  domains: ['properties'],
  navHiddenKeys: ['properties'],
})
