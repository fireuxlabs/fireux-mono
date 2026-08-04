import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

export default defineFireuxConfig({
  ecosystem: 'werkbox',
  // Preserve deployed authority until a separately approved remote identity migration exists.
  projectId: 'cleanbox',
  ecosystemId: 'cleanbox',
  id: 'cleanbox-app',
  name: 'Werkbox',
  shortName: 'Werkbox',
  role: 'global',
  domains: ['jobs'],
  profiles: ['agent', 'professional'],
  selfJoinEnabled: true,
  navHiddenKeys: ['operations'],
  navOverrides: {
    'dashboard-home': { label: 'Workspace' },
    'dashboard-agent-profile': { label: 'Hiring profile' },
    'dashboard-agent-my-gigs': {
      label: 'Hiring',
      desktop: true,
    },
    'dashboard-professional-profile': { label: 'Professional profile' },
    'dashboard-professional-my-work': {
      label: 'Applications & work',
      desktop: true,
    },
  },
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
