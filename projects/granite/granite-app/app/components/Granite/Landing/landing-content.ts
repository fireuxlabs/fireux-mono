import type {
  LandingOperationRailItem,
  LandingProductIndexContent,
  LandingProductSurface,
} from 'fireux-core/types/landing-product'
import { portfolioOperations } from 'fireux-properties/runtime/portfolio/models/operations'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Property Portfolio', 'Operations'],
    description:
      'An integrated property platform connecting portfolios, compliance, documents and incidents directly to your Portfolio Console. Manage properties and clients, track obligations, coordinate tasks and review financial signals.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: {
      label: 'Go to console',
      to: '/console/portfolio',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const railItems = portfolioOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  icon: operation.icon,
  to: `/operations/${operation.slug}`,
})) satisfies readonly LandingOperationRailItem[]

export const surfaceItems = [
  {
    id: 'portfolio-console',
    title: 'Portfolio Console',
    description:
      'Manage property portfolios, clients, compliance, incidents, documents, tasks and financial signals in one Console.',
    icon: 'i-lucide-layout-dashboard',
    to: '/console/portfolio',
    action: 'Open Portfolio Console',
    items: [
      'Properties and clients',
      'Compliance and incidents',
      'Documents and tasks',
      'Finance',
    ],
  },
] as const satisfies readonly LandingProductSurface[]
