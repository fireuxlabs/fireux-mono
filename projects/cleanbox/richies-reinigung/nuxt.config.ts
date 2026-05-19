import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'cleanbox',
  id: 'richies-reinigung',
  name: 'Richies',
  shortName: 'Richies',
  role: 'tenant',
  consoles: [],
  modules: [
    // tenant stays lean
  ],
})
