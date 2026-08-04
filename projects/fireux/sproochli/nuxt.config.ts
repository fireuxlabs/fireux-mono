import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  projectId: 'fireux',
  id: 'sproochli',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  modules: ['fireux-sproochli', 'fireux-ai', 'fireux-products'],
})
