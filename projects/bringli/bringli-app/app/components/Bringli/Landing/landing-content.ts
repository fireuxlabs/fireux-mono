import type {
  LandingOperationRailItem,
  LandingProductIndexContent,
  LandingProductSurface,
} from 'fireux-core/types/landing-product'
import { supplierOperations } from 'fireux-suppliers/runtime/content/operations'

export const content = {
  hero: {
    title: 'The Control Centre For',
    accent: ['Supply', 'Operations'],
    description:
      'An integrated supply platform connecting local producers, customers and delivery work directly to your Supply Console. Publish supplier profiles, organise product information, coordinate coverage and manage delivery handoffs.',
    primaryAction: { label: 'Get started', to: '/get-started' },
    secondaryAction: {
      label: 'Go to console',
      to: '/console/supplier',
      icon: 'i-lucide-layout-dashboard',
    },
    trustItems: [],
  },
} as const satisfies LandingProductIndexContent

export const railItems = supplierOperations.map((operation) => ({
  id: operation.id,
  title: operation.title,
  icon: operation.icon,
  to: `/operations/${operation.slug}`,
})) satisfies readonly LandingOperationRailItem[]

export const surfaceItems = [
  {
    id: 'suppliers',
    title: 'Supplier Profiles',
    description:
      'Publish who a supplier is, what they provide and where they operate.',
    icon: 'i-lucide-store',
    to: '/suppliers',
    action: 'Browse suppliers',
    items: [
      'Supplier identity',
      'Public profile',
      'Coverage',
      'Contact doorway',
    ],
  },
  {
    id: 'supply-console',
    title: 'Supply Console',
    description:
      'Organise catalogues, ingredients and supplied items from one operational workspace.',
    icon: 'i-lucide-layout-dashboard',
    to: '/console/supplier',
    action: 'Open Supply Console',
    items: ['Catalogue', 'Ingredients', 'Items', 'Supplier identity'],
  },
] as const satisfies readonly LandingProductSurface[]
