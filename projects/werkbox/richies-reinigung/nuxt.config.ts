import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // Preserve deployed authority until a separately approved remote identity migration exists.
  projectId: 'cleanbox',
  ecosystemId: 'cleanbox',
  id: 'richies-reinigung',
  name: 'Richies',
  shortName: 'Richies',
  role: 'tenant',
})
