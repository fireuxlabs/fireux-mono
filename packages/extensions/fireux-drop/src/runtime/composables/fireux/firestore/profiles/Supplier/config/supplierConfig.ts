import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  cta: 'Create your Supplier profile to appear in listings.',
  navLabel: 'Supplier',
  navIcon: 'i-lucide-package',
} as const
