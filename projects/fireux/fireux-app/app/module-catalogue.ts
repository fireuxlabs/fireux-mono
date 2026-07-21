// Concurrent edit — 2026-07-21 16:03 CEST — Extension module catalogue: author the FireUX-facing projection of reusable packages.

export type FireuxExtensionModule = {
  id: string
  name: string
  description: string
  icon: string
}

export const fireuxExtensionModules = [
  {
    id: 'fireux-ai',
    name: 'AI',
    description: 'Shared server-side AI integration for FireUX apps.',
    icon: 'i-lucide-bot',
  },
  {
    id: 'fireux-blogs',
    name: 'Blogs',
    description: 'Blog posts, editing, and public publishing.',
    icon: 'i-lucide-newspaper',
  },
  {
    id: 'fireux-companies',
    name: 'Companies',
    description: 'Company records and reusable company profiles.',
    icon: 'i-lucide-building-2',
  },
  {
    id: 'fireux-compliance',
    name: 'Compliance',
    description: 'Compliance records, requirements, and expiry monitoring.',
    icon: 'i-lucide-badge-check',
  },
  {
    id: 'fireux-documents',
    name: 'Documents',
    description: 'Document storage linked to the records that use it.',
    icon: 'i-lucide-files',
  },
  {
    id: 'fireux-go-qr',
    name: 'Go QR',
    description: 'QR-code provider integration for FireUX apps.',
    icon: 'i-lucide-qr-code',
  },
  {
    id: 'fireux-jobs',
    name: 'Jobs',
    description: 'Job listings, applications, and hiring workflows.',
    icon: 'i-lucide-briefcase-business',
  },
  {
    id: 'fireux-kitchens',
    name: 'Kitchens',
    description: 'Kitchen records, consoles, and daily operations.',
    icon: 'i-lucide-cooking-pot',
  },
  {
    id: 'fireux-places',
    name: 'Places',
    description: 'Place records with Google Places integration.',
    icon: 'i-lucide-map-pin',
  },
  {
    id: 'fireux-products',
    name: 'Products',
    description: 'Product catalogues with optional Stripe integration.',
    icon: 'i-lucide-package',
  },
  {
    id: 'fireux-properties',
    name: 'Properties',
    description: 'Property and portfolio management for FireUX apps.',
    icon: 'i-lucide-house',
  },
  {
    id: 'fireux-sproochli',
    name: 'Sproochli',
    description: 'Multilingual information pages and content tooling.',
    icon: 'i-lucide-panels-top-left',
  },
  {
    id: 'fireux-suppliers',
    name: 'Suppliers',
    description: 'Supplier records, catalogues, and console operations.',
    icon: 'i-lucide-truck',
  },
  {
    id: 'fireux-tasks',
    name: 'Tasks',
    description: 'Tasks that can connect work across FireUX domains.',
    icon: 'i-lucide-list-checks',
  },
  {
    id: 'fireux-translation',
    name: 'Translation',
    description: 'Shared translation tools and language catalogues.',
    icon: 'i-lucide-languages',
  },
] as const satisfies readonly FireuxExtensionModule[]
