import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const portfolioWorkspace = {
  id: 'portfolio',
  name: 'Portfolio workspace',
  to: '/workspace/portfolio',
} as const

export const portfolioOperations = [
  [
    'properties',
    'Properties',
    'Manage properties in the selected portfolio.',
    'i-lucide-building-2',
  ],
  [
    'compliance',
    'Compliance',
    'Review compliance work for the selected portfolio.',
    'i-lucide-shield-check',
  ],
  [
    'documents',
    'Documents',
    'Manage documents for the selected portfolio.',
    'i-lucide-files',
  ],
  [
    'tasks',
    'Tasks',
    'Coordinate tasks for the selected portfolio.',
    'i-lucide-list-checks',
  ],
  [
    'finance',
    'Finance',
    'Review financial signals for the selected portfolio.',
    'i-lucide-chart-line',
  ],
].map(([slug, title, description, icon]) => ({
  id: `portfolio.${slug}`,
  slug,
  title,
  description,
  to: `/workspace/portfolio/${slug}`,
  workspace: portfolioWorkspace,
  icon,
})) satisfies FireuxMetaOperation[]
