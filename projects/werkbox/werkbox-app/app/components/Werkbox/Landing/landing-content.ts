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
      'Werkbox connects practical jobs, skilled professionals, and the organisations that keep places running.',
    primaryAction: {
      label: 'Browse jobs',
      to: '/jobs',
      icon: 'i-lucide-search',
    },
    secondaryAction: {
      label: 'Post a job',
      to: '/jobs/manage',
      icon: 'i-lucide-circle-plus',
    },
    quietAction: {
      label: 'Explore cleaning',
      to: '/categories/cleaning',
    },
    trustItems: [
      'Direct employer relationships',
      'Reusable professional profiles',
      'Product-neutral job categories',
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
        'Browse open roles and use a reusable Professional profile when you apply.',
      action: { label: 'Browse jobs', to: '/jobs' },
    },
    {
      id: 'hire',
      kind: 'join',
      title: 'Hire practical professionals',
      description:
        'Create an Agent profile, publish a role, and manage applications directly.',
      action: { label: 'Post a job', to: '/jobs/manage' },
    },
  ],
} satisfies LandingProductEntryContent

export const networkCatalogue = {
  sectionId: 'werkbox-network',
  eyebrow: 'The network',
  title: 'Work, organisations, and people stay connected.',
  description:
    'Each surface uses the same Jobs, Agent, Professional, Company, and Place foundations.',
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
      description: 'Discover organisations represented by Agent profiles.',
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
