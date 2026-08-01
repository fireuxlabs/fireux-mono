// Concurrent edit — 2026-07-21 12:23 CEST — Cleanbox-to-Werkbox app migration: add the additive Werkbox global app config.
// Concurrent edit — 2026-07-22 12:37 CEST — Shared Job spine alignment: make categories the only app-configured Job delta.
// Concurrent edit — 2026-07-22 12:56 CEST — Werkbox all-category scope: expose the general practical-work Job hub.
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // Preserve deployed authority until a separately approved remote identity migration exists.
  projectId: 'cleanbox',
  ecosystemId: 'cleanbox',
  databaseId: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Werkbox',
  shortName: 'Werkbox',
  brand: { owner: 'app', status: 'provisional' },
  role: 'global',
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  selfJoinEnabled: true,
  seo: {
    staticPaths: ['/categories/cleaning'],
  },
  modules: [
    'fireux-places',
    'fireux-companies',
    [
      'fireux-jobs',
      {
        categories: 'all',
      },
    ],
  ],
})
