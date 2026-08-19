import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const propertyConsole = {
  id: 'property',
  name: 'Property console',
  to: '/console/property',
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
  to: `/console/property/${slug}`,
  console: propertyConsole,
  icon,
})) satisfies FireuxMetaOperation[]
