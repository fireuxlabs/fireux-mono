import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  extends: ['fireux-core/layer', 'fireux-slap/layer', 'fireux-blogs/layer', 'fireux-products/layer'],
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'slap-app',
  name: 'Slap',
  shortName: 'Slap',
  role: 'global',
  modules: ['fireux-products'],
})
