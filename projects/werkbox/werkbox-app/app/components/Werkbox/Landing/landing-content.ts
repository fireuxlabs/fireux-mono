import type {
  LandingProductCatalogueContent,
  LandingProductEntryContent,
  LandingProductIndexContent,
} from 'fireux-core/types/landing-product'

export const content = {
  hero: {
    badge: 'Werkbox',
    kicker: 'Practical work',
    title: 'Find Good Work.',
    accent: 'Build A Strong Team.',
    description:
      'Browse public practical jobs before you join. Meet named employers directly, or build your team without a hiring commission.',
    primaryAction: {
      label: 'Browse jobs',
      to: '/jobs',
      icon: 'i-lucide-search',
    },
    secondaryAction: {
      label: 'Hire directly',
      to: '/jobs/manage',
      icon: 'i-lucide-circle-plus',
    },
    quietAction: {
      label: 'How direct hiring works',
      to: '/jobs/learn-more',
    },
    trustItems: [
      'Open jobs before signup',
      'Direct employer relationships',
      'No hiring commission',
    ],
  },
} as const satisfies LandingProductIndexContent

export const entryPaths = {
  sectionId: 'werkbox-entry',
  eyebrow: 'Start with Werkbox',
  title: 'Looking for work or building a team?',
  description:
    'Use one practical-work network from either side of the relationship.',
  paths: [
    {
      id: 'find-work',
      kind: 'start',
      title: 'Find practical work',
      description:
        'See published roles, employers, workplaces, and terms before you create a reusable Professional profile to apply.',
      action: { label: 'Browse jobs', to: '/jobs' },
    },
    {
      id: 'hire',
      kind: 'join',
      title: 'Hire practical professionals',
      description:
        'Publish roles, meet applicants, and hire directly without paying a percentage of their work.',
      action: { label: 'Hire directly', to: '/jobs/manage' },
    },
  ],
} satisfies LandingProductEntryContent

export const networkCatalogue = {
  sectionId: 'werkbox-network',
  eyebrow: 'The network',
  title: 'Work, organisations, and people stay connected.',
  description:
    'Each surface uses the same Jobs, hiring profile, professional profile, Company, and Place foundations.',
  items: [
    {
      id: 'jobs',
      title: 'Jobs',
      description: 'Browse current practical-work opportunities.',
      icon: 'i-lucide-briefcase-business',
      to: '/jobs',
      action: 'Browse jobs',
    },
    {
      id: 'agents',
      title: 'Service organisations',
      description:
        'Discover organisations represented by public hiring profiles.',
      icon: 'i-lucide-building-2',
      to: '/agents',
      action: 'Browse organisations',
    },
    {
      id: 'professionals',
      title: 'Professionals',
      description: 'Find people who publish practical-work profiles.',
      icon: 'i-lucide-users',
      to: '/professionals',
      action: 'Browse professionals',
    },
  ],
} satisfies LandingProductCatalogueContent
