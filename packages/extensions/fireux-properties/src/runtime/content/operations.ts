import type { FireuxMetaOperation } from 'fireux-core/runtime/models/system/meta-content.model'

const portfolioConsole = {
  id: 'portfolio',
  name: 'Portfolio console',
  to: '/console/portfolio',
} as const

const propertyConsole = {
  id: 'property',
  name: 'Property console',
  to: '/console/property',
} as const

export const portfolioOperations = [
  [
    'identity',
    'Identity',
    'Manage the selected portfolio identity.',
    'i-lucide-info',
  ],
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
  ['team', 'Team', 'Manage portfolio team access and roles.', 'i-lucide-users'],
].map(([slug, title, description, icon]) => ({
  id: `portfolio.${slug}`,
  slug,
  title,
  description,
  to: `/console/portfolio/${slug}`,
  console: portfolioConsole,
  icon,
})) satisfies FireuxMetaOperation[]

export const propertyOperations = [
  [
    'identity',
    'Identity',
    'Manage the selected property identity.',
    'i-lucide-info',
  ],
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
  ['team', 'Team', 'Manage property team access and roles.', 'i-lucide-users'],
].map(([slug, title, description, icon]) => ({
  id: `property.${slug}`,
  slug,
  title,
  description,
  to: `/console/property/${slug}`,
  console: propertyConsole,
  icon,
})) satisfies FireuxMetaOperation[]
