// FILE: packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { AppProfileBase, CoreProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import { chefConfig } from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  chefs/{uid}
 * App doc:   apps/{appId}/chefs/{uid}
 */

export type ChefCoreShape = CoreProfileBase & {
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  organization_name: string
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

  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type ChefCore = ChefCoreShape

export type ChefAppShape = AppProfileBase

export const ChefApp: ChefAppShape = {
  id: '',
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type ChefApp = ChefAppShape

export { chefConfig }

