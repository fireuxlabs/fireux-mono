//packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../../../core/fireux-core/src/runtime/models/profiles/profile.model'
import { createFieldMapper } from '../../../../../../core/fireux-core/src/runtime/utils/fieldMap'

/** Global doc: professionals/{uid} */
export interface ProfessionalCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/professionals/{uid} */
export interface ProfessionalAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI props */
export interface ProfessionalPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}
export interface ProfessionalCellProps extends ProfessionalPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface ProfessionalProfileProps extends ProfessionalCellProps {
  bioLong?: string | null
}

/** Validation + Config */
export function validateProfessionalProfile(
  p: Partial<ProfessionalCoreProfile>
): boolean {
  return !!p?.name
}

export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  // requiredFields/searchableFields removed in slim ProfileConfig
} as const

/** Input / Update */
export type ProfessionalInput = Omit<
  ProfessionalCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type ProfessionalUpdate = Partial<ProfessionalInput>

// Back-compat alias (kept for type stability)
export type Professional = ProfessionalCoreProfile

// Field mapping: UI camelCase ↔ Firestore snake_case
export const ProfessionalMapper = createFieldMapper<
  { bioShort?: string | null; bioLong?: string | null },
  Record<string, unknown>
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
