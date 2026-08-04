import type { LandingOperationRailItem, LandingProductIndexContent, LandingProductSurface } from 'fireux-core/types/landing-product'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Guest', 'Operations'],
    description: 'An integrated guest information platform connecting QR stay guides directly to your Host Console. Publish check-in details, house rules and local recommendations. Manage properties, rooms, reservations and guest information.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: { label: 'Go to console', to: '/console/property', icon: 'i-lucide-layout-dashboard' },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const railItems = [
  { id: 'properties', title: 'Properties', icon: 'i-lucide-building-2', to: '/properties' },
  { id: 'guides', title: 'Guest guides', icon: 'i-lucide-book-open', to: '/properties/preview-stay/info' },
  { id: 'reservations', title: 'Reservations', icon: 'i-lucide-calendar-days', to: '/console/property/reservations' },
  { id: 'calendar', title: 'Calendar', icon: 'i-lucide-calendar-range', to: '/console/property/calendar' },
] as const satisfies readonly LandingOperationRailItem[]

export const surfaceItems = [
  {
    id: 'guest-guide',
    title: 'Guest Guide',
    description: 'Give guests one mobile place for check-in, Wi-Fi, house rules, recommendations and checkout information.',
    icon: 'i-lucide-smartphone',
    to: '/properties/preview-stay/info',
    action: 'View guest guide',
    items: ['Guest URL', 'QR access', 'Stay information', 'Local recommendations'],
  },
  {
    id: 'host-console',
    title: 'Host Console',
    description: 'Manage the property, room, reservation and guest information used throughout the stay.',
    icon: 'i-lucide-layout-dashboard',
    to: '/console/property',
    action: 'Open Host Console',
    items: ['Properties', 'Rooms', 'Reservations', 'Calendar'],
  },
] as const satisfies readonly LandingProductSurface[]
