import { defineFireuxEcosystem } from 'fireux-ecosystem/config'

export default defineFireuxEcosystem({
  ecosystem: 'slap',
  extends: ['fireux-core/layer', 'fireux-slap/layer'],
  projectId: 'slap',
  ecosystemId: 'slap',
  id: 'slap-app',
  context:
    'Slap is a culture-commerce ecosystem for brands, combining storefronts, product drops, stories and galleries. Brand expression is central to each App’s presentation.',
  name: 'Slap',
  shortName: 'Slap',
  role: 'global',
})
