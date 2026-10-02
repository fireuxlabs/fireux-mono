import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'holzworm',
  name: 'Holzworm',
  shortName: 'Holzworm',
  databaseId: 'holzworm',
  role: 'standalone',
})
