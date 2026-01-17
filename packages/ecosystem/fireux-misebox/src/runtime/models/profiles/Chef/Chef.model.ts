// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { chefConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export type ChefCoreShape = {
  id: string
  title: string
  subtitle: string
  tagline: string
  tags: string[]

  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  organization_name: string

  creator_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const ChefCore: ChefCoreShape = {
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
}

export type ChefCore = ChefCoreShape

export type ChefAppShape = {
  id: string
  creator_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const ChefApp: ChefAppShape = {
  id: '',
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type ChefApp = ChefAppShape

export { chefConfig }

