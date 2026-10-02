import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'fireux',
  extends: ['fireux-core/layer', 'fireux-blogs/layer', 'fireux-ai/layer', 'fireux-products/layer'],
  projectId: 'fireux',
  ecosystemId: 'fireux',
  id: 'sproochli',
  name: 'Sproochli',
  shortName: 'Sproochli',
  databaseId: 'sproochli',
  role: 'standalone',
  modules: ['fireux-sproochli', 'fireux-ai', 'fireux-products'],
})
