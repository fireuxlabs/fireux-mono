// Concurrent edit — 2026-07-21 12:23 CEST — Cleanbox-to-Werkbox app migration: add the additive Werkbox global app config.
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
        categories: ['cleaning'],
        workplaces: ['place'],
        defaultWorkplaceType: 'place',
      },
    ],
  ],
})
