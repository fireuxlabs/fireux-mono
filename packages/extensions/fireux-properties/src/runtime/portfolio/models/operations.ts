import type {
  FireuxMetaOperation,
  WorkspaceCapabilityFamilies,
} from 'fireux-core/config/app/meta-content'

const portfolioWorkspace = {
  id: 'portfolio',
  name: 'Portfolio workspace',
  to: '/workspace/portfolio',
} as const

const portfolioCapabilityFamilies = {
  properties: {
    surfaces: ['catalogue', 'relationship-directory'],
    entries: ['search-connect'],
    tools: ['record', 'relationship'],
    scopes: ['local'],
  },
  compliance: {
    surfaces: ['control-checklist', 'event-ledger'],
    entries: [],
    tools: ['workflow', 'analysis'],
    scopes: ['local', 'compound'],
  },
  documents: {
    surfaces: ['asset-vault'],
    entries: ['import-create'],
    tools: ['record'],
    scopes: ['local'],
  },
  tasks: {
    surfaces: ['work-queue'],
    entries: ['quick-create', 'derived-create'],
    tools: ['record', 'workflow'],
    scopes: ['local'],
  },
  finance: {
    surfaces: ['report'],
    entries: [],
    tools: ['analysis'],
    scopes: ['compound'],
  },
} as const satisfies Record<string, WorkspaceCapabilityFamilies>

const portfolioOperationDefinitions = [
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
] as const

export const portfolioOperations = portfolioOperationDefinitions.map(
  ([slug, title, description, icon]) => ({
    id: `portfolio.${slug}`,
    slug,
    title,
    description,
    to: `/workspace/portfolio/${slug}`,
    workspace: portfolioWorkspace,
    capabilityFamilies: portfolioCapabilityFamilies[slug],
    icon,
  })
) satisfies FireuxMetaOperation[]
