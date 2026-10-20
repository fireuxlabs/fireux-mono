import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'slap',
  extends: ['fireux-core/layer', 'fireux-slap/layer', 'fireux-blogs/layer', 'fireux-products/layer'],
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'slap-app',
  context: "Slap is a culture-commerce ecosystem for brands, combining storefronts, product drops, stories and galleries. Brand expression is central to each App’s presentation.",
  name: 'Slap',
  shortName: 'Slap',
  role: 'global',
  modules: ['fireux-products'],
})
