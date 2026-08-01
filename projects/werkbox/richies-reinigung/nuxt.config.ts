// Concurrent edit — 2026-07-21 12:23 CEST — Cleanbox-to-Werkbox app migration: re-home Richies under the Werkbox identity.
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // Preserve deployed authority until a separately approved remote identity migration exists.
  projectId: 'cleanbox',
  ecosystemId: 'cleanbox',
  databaseId: 'cleanbox',
  id: 'richies-reinigung',
  name: 'Richies',
  shortName: 'Richies',
  brand: { owner: 'app', status: 'provisional' },
  role: 'tenant',
})
