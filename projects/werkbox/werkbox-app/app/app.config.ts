// Concurrent edit — 2026-07-21 12:17 CEST — Cleanbox-to-Werkbox app migration: establish the restrained Werkbox theme.
export default defineAppConfig({
  navigation: {
    hiddenKeys: ['operations'],
    overrides: {
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
  },
  ui: {
    colors: {
      primary: 'amber',
      neutral: 'slate',
    },
  },
})
