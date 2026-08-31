import type {
  FireuxMetaOperation,
  WorkspaceCapabilityFamilies,
} from 'fireux-core/config/app/meta-content'

const propertyWorkspace = {
  id: 'property',
  name: 'Property workspace',
  to: '/workspace/property',
} as const

const propertyCapabilityFamilies = {
  reservations: {
    surfaces: ['calendar', 'work-queue'],
    entries: ['quick-create'],
    tools: ['record', 'workflow'],
    scopes: ['local'],
  },
  calendar: {
    surfaces: ['calendar'],
    entries: [],
    tools: ['analysis'],
    scopes: ['compound'],
  },
} as const satisfies Record<string, WorkspaceCapabilityFamilies>

const propertyOperationDefinitions = [
  [
    'reservations',
    'Reservations',
    'Manage reservations for the selected property.',
    'i-lucide-calendar-days',
  ],
  [
    'calendar',
    'Calendar',
    'Review property reservation dates and availability.',
    'i-lucide-calendar-range',
  ],
] as const

export const propertyOperations = propertyOperationDefinitions.map(
  ([slug, title, description, icon]) => ({
    id: `property.${slug}`,
    slug,
    title,
    description,
    to: `/workspace/property/${slug}`,
    workspace: propertyWorkspace,
    capabilityFamilies: propertyCapabilityFamilies[slug],
    icon,
  })
) satisfies FireuxMetaOperation[]
