// Concurrent edit — 2026-07-21 16:03 CEST — Extension module catalogue: author the FireUX-facing projection of reusable packages.
// Concurrent edit — 2026-07-21 16:27 CEST — FireUX Finance pass: include the new product-neutral finance capability package.

export type FireuxExtensionModuleGroupId =
  | 'platform'
  | 'content'
  | 'business'
  | 'location'
  | 'hospitality'

export type FireuxExtensionModule = {
  id: string
  name: string
  description: string
  icon: string
  group: FireuxExtensionModuleGroupId
}

export const fireuxExtensionModuleGroups = [
  {
    id: 'platform',
    name: 'Platform services',
    description: 'Shared capability used across otherwise different apps.',
  },
  {
    id: 'content',
    name: 'Content and commerce',
    description: 'Publish, organise, and sell structured content.',
  },
  {
    id: 'business',
    name: 'Business operations',
    description: 'Reusable records and workflows for running work.',
  },
  {
    id: 'location',
    name: 'Places and property',
    description: 'Capability built around locations and physical assets.',
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    description: 'Specialist capability for kitchens and their supply chain.',
  },
] as const satisfies readonly {
  id: FireuxExtensionModuleGroupId
  name: string
  description: string
}[]

export const fireuxExtensionModules = [
  {
    id: 'fireux-ai',
    name: 'AI',
    description: 'Shared server-side AI integration for FireUX apps.',
    icon: 'i-lucide-bot',
    group: 'platform',
  },
  {
    id: 'fireux-blogs',
    name: 'Blogs',
    description: 'Blog posts, editing, and public publishing.',
    icon: 'i-lucide-newspaper',
    group: 'content',
  },
  {
    id: 'fireux-companies',
    name: 'Companies',
    description: 'Company records and reusable company profiles.',
    icon: 'i-lucide-building-2',
    group: 'business',
  },
  {
    id: 'fireux-compliance',
    name: 'Compliance',
    description: 'Compliance records, requirements, and expiry monitoring.',
    icon: 'i-lucide-badge-check',
    group: 'business',
  },
  {
    id: 'fireux-documents',
    name: 'Documents',
    description: 'Document storage linked to the records that use it.',
    icon: 'i-lucide-files',
    group: 'content',
  },
  {
    id: 'fireux-finance',
    name: 'Finance',
    description: 'Immutable financial facts and money primitives for domain operations.',
    icon: 'i-lucide-landmark',
    group: 'business',
  },
  {
    id: 'fireux-go-qr',
    name: 'Go QR',
    description: 'QR-code provider integration for FireUX apps.',
    icon: 'i-lucide-qr-code',
    group: 'platform',
  },
  {
    id: 'fireux-jobs',
    name: 'Jobs',
    description: 'Job listings, applications, and hiring workflows.',
    icon: 'i-lucide-briefcase-business',
    group: 'business',
  },
  {
    id: 'fireux-kitchens',
    name: 'Kitchens',
    description: 'Kitchen records, workspaces, and daily operations.',
    icon: 'i-lucide-cooking-pot',
    group: 'hospitality',
  },
  {
    id: 'fireux-places',
    name: 'Places',
    description: 'Place records with Google Places integration.',
    icon: 'i-lucide-map-pin',
    group: 'location',
  },
  {
    id: 'fireux-products',
    name: 'Products',
    description: 'Product catalogues with optional Stripe integration.',
    icon: 'i-lucide-package',
    group: 'content',
  },
  {
    id: 'fireux-properties',
    name: 'Properties',
    description: 'Property and portfolio management for FireUX apps.',
    icon: 'i-lucide-house',
    group: 'location',
  },
  {
    id: 'fireux-sproochli',
    name: 'Sproochli',
    description: 'Multilingual information pages and content tooling.',
    icon: 'i-lucide-panels-top-left',
    group: 'content',
  },
  {
    id: 'fireux-suppliers',
    name: 'Suppliers',
    description: 'Supplier records, catalogues, and workspace operations.',
    icon: 'i-lucide-truck',
    group: 'hospitality',
  },
  {
    id: 'fireux-tasks',
    name: 'Tasks',
    description: 'Tasks that can connect work across FireUX domains.',
    icon: 'i-lucide-list-checks',
    group: 'business',
  },
  {
    id: 'fireux-translation',
    name: 'Translation',
    description: 'Shared translation tools and language catalogues.',
    icon: 'i-lucide-languages',
    group: 'platform',
  },
] as const satisfies readonly FireuxExtensionModule[]
