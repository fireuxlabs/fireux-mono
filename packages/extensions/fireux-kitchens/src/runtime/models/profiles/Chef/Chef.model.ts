// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { chefConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export const ChefCore = {
  id: '',

  // Chef (scoped, v1)
  chef_headline: '',
  chef_summary: '',
  chef_bio: '',
  chef_image: '',

  // Chef descriptors (scoped)
  chef_signature_dishes: [] as string[],

  // Optional org label (scoped)
  chef_organization_name: '',

  // Legacy (deprecated) — kept temporarily for non-breaking migration
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],
  bio_short: '',
  bio_long: '',
  specialties: [] as string[],
  locations: [] as string[],
  organization_name: '',

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ChefCore = {
  [K in keyof typeof ChefCore]: (typeof ChefCore)[K]
}

export const ChefApp = {
  id: '',

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ChefApp = {
  [K in keyof typeof ChefApp]: (typeof ChefApp)[K]
}

export { chefConfig }

