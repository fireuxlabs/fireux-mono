import type {
  LandingProductCatalogueContent,
  LandingProductIndexContent,
  LandingProductSurface,
} from 'fireux-core/runtime/components/landing/product.types'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Recruitment', 'Operations'],
    description:
      'An integrated work platform connecting jobs, employers and professionals directly to your Work Workspace. Publish work, review applications, coordinate teams and manage customer jobs.',
    primaryAction: {
      label: 'Get started',
      to: '/get-started',
    },
    secondaryAction: {
      label: 'Go to workspace',
      to: '/jobs/manage',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const surfaceItems = [
  {
    id: 'jobs',
    title: 'Jobs',
    description:
      'Publish work where professionals can find it and review the named employer before applying.',
    icon: 'i-lucide-briefcase-business',
    to: '/jobs',
    action: 'Browse jobs',
    items: [
      'Published jobs',
      'Named employers',
      'Workplaces',
      'Direct applications',
    ],
  },
  {
    id: 'employer',
    title: 'Employer Workspace',
    description:
      'Publish jobs, review applications and manage direct hiring work.',
    icon: 'i-lucide-building-2',
    to: '/jobs/manage',
    action: 'Open employer workspace',
    items: [
      'Job publishing',
      'Applications',
      'Hiring status',
      'Employer control',
    ],
  },
  {
    id: 'professionals',
    title: 'Professional Profiles',
    description:
      'Give professionals a reusable public identity for their experience and applications.',
    icon: 'i-lucide-user-round-search',
    to: '/professionals',
    action: 'Browse professionals',
    items: ['Public profiles', 'Work identity', 'Experience', 'Applications'],
  },
] as const satisfies readonly LandingProductSurface[]

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
