import type {
  LandingOperationRailItem,
  LandingProductIndexContent,
  LandingProductSurface,
} from 'fireux-core/types/landing-product'
import { propertyCapabilities } from 'fireux-properties/runtime/property/models/capabilities'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Guest', 'Operations'],
    description:
      'An integrated guest information platform connecting QR stay guides directly to your Host Workspace. Publish check-in details, house rules and local recommendations. Manage properties, rooms, reservations and guest information.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: {
      label: 'Go to workspace',
      to: '/workspace/property',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const railItems = propertyCapabilities.map((operation) => ({
  id: operation.id,
  title: operation.title,
  icon: operation.icon,
  to: `/operations/${operation.slug}`,
})) satisfies readonly LandingOperationRailItem[]

export const surfaceItems = [
  {
    id: 'guest-guide',
    title: 'Guest Guide',
    description:
      'Give guests one mobile place for check-in, Wi-Fi, house rules, recommendations and checkout information.',
    icon: 'i-lucide-smartphone',
    to: '/get-started',
    action: 'View guest guide',
    items: [
      'Guest URL',
      'QR access',
      'Stay information',
      'Local recommendations',
    ],
  },
  {
    id: 'host-workspace',
    title: 'Host Workspace',
    description:
      'Manage the property, room, reservation and guest information used throughout the stay.',
    icon: 'i-lucide-layout-dashboard',
    to: '/workspace/property',
    action: 'Open Host Workspace',
    items: ['Properties', 'Rooms', 'Reservations', 'Calendar'],
  },
] as const satisfies readonly LandingProductSurface[]
