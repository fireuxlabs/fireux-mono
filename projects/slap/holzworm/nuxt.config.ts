import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'holzworm',
  name: 'Holzworm',
  shortName: 'Holzworm',
  brand: { owner: 'core' },
  databaseId: 'slap',
  role: 'tenant',
  seo: {
    staticPaths: ['/'],
  },
})
