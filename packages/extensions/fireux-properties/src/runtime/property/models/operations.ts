import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const propertyWorkspace = {
  id: 'property',
  name: 'Property workspace',
  to: '/workspace/property',
} as const

export const propertyOperations = [
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
].map(([slug, title, description, icon]) => ({
  id: `property.${slug}`,
  slug,
  title,
  description,
  to: `/workspace/property/${slug}`,
  workspace: propertyWorkspace,
  icon,
})) satisfies FireuxMetaOperation[]
