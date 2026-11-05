import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'holzworm',
  context:
    'Holzworm presents wooden laser-engraving product concepts associated with Bern. Product concepts should remain distinguishable from confirmed products available to order.',
  name: 'Holzworm',
  shortName: 'Holzworm',
  databaseId: 'holzworm',
  role: 'standalone',
})
