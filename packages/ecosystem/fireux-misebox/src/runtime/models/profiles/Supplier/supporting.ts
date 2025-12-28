// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts

/**
 * Supplier profile metadata holder. Mirrors Professional/Chef structure
 * and gives dashboard surfaces a single config import path.
 */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

export const supplierConfig: ProfileConfig = {
  id: 'supplier',
  collectionName: 'suppliers',
  profileType: 'Supplier',
  cta: 'Create your Supplier profile to appear in listings.',
  navLabel: 'Supplier',
  navIcon: 'i-lucide-package',
} as const
