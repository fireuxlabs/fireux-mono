// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { chefConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export const ChefCore = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],

  bio_short: '',
  bio_long: '',
  specialties: [] as string[],
  locations: [] as string[],
  organization_name: '',

  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ChefCore = {
  [K in keyof typeof ChefCore]: (typeof ChefCore)[K]
}

export const ChefApp = {
  id: '',
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ChefApp = {
  [K in keyof typeof ChefApp]: (typeof ChefApp)[K]
}

export { chefConfig }

