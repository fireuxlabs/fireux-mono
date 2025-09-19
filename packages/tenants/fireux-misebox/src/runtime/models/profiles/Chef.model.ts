//packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from 'fireux-core/runtime/models/profiles/profile.model'
import { createFieldMapper } from 'fireux-core/runtime/utils/fieldMap'

/** Global doc: chefs/{uid} */
export interface ChefCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/chefs/{uid} */
export interface ChefAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI views */
export interface ChefPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}

export interface ChefCellProps extends ChefPillProps {
  bioShort?: string | null
  specialties?: string[]
}

export interface ChefProfileProps extends ChefCellProps {
  bioLong?: string | null
}

/** Validation + Config */
export function validateChefProfile(p: Partial<ChefCoreProfile>): boolean {
  return !!p?.name
}

export const chefConfig: ProfileConfig = {
  id: 'chef',
  collectionName: 'chefs',
  profileType: 'Chef',
  requiredFields: ['name'],
  searchableFields: ['name', 'specialties'],
  ctaTitle: "Showcase your culinary expertise",
  ctaDescription:
    "Create your Chef profile to highlight your skills, share your specialties, and connect with opportunities in the Misebox community.",
} as const

/** Input / Update */
export type ChefInput = Omit<
  ChefCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type ChefUpdate = Partial<ChefInput>

// Field mapping: UI camelCase ↔ Firestore snake_case
const chefFieldMap = {
  bioShort: 'bio_short',
  bioLong: 'bio_long',
} as const

export const ChefMapper = createFieldMapper<
  Partial<ChefCoreProfile>,
  Record<string, unknown>
>(chefFieldMap)
