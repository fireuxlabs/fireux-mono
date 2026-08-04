import type { LandingOperationRailItem, LandingProductIndexContent, LandingProductSurface } from 'fireux-core/types/landing-product'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Property Portfolio', 'Operations'],
    description: 'An integrated property platform connecting portfolios, compliance, documents and incidents directly to your Portfolio Console. Manage properties and clients, track obligations, coordinate tasks and review financial signals.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: { label: 'Go to console', to: '/console/portfolio', icon: 'i-lucide-layout-dashboard' },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const railItems = [
  { id: 'portfolios', title: 'Portfolios', icon: 'i-lucide-layers', to: '/console/portfolio' },
  { id: 'properties', title: 'Properties', icon: 'i-lucide-building-2', to: '/console/portfolio/properties' },
  { id: 'clients', title: 'Clients', icon: 'i-lucide-users', to: '/console/portfolio/clients' },
  { id: 'compliance', title: 'Compliance', icon: 'i-lucide-shield-check', to: '/console/portfolio/compliance' },
  { id: 'incidents', title: 'Incidents', icon: 'i-lucide-triangle-alert', to: '/console/portfolio/incidents' },
  { id: 'documents', title: 'Documents', icon: 'i-lucide-files', to: '/console/portfolio/documents' },
  { id: 'tasks', title: 'Tasks', icon: 'i-lucide-list-checks', to: '/console/portfolio/tasks' },
  { id: 'finance', title: 'Finance', icon: 'i-lucide-chart-no-axes-combined', to: '/console/portfolio/finance' },
] as const satisfies readonly LandingOperationRailItem[]

export const surfaceItems = [
  {
    id: 'portfolio-console',
    title: 'Portfolio Console',
    description: 'Manage property portfolios, clients, compliance, incidents, documents, tasks and financial signals in one Console.',
    icon: 'i-lucide-layout-dashboard',
    to: '/console/portfolio',
    action: 'Open Portfolio Console',
    items: ['Properties and clients', 'Compliance and incidents', 'Documents and tasks', 'Finance'],
  },
] as const satisfies readonly LandingProductSurface[]
