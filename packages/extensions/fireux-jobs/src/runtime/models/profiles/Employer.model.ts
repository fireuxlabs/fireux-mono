//packages/extensions/fireux-jobs/src/runtime/models/profiles/Employer.model.ts
import type {
  ProfileBase,
  ProfileConfig,
} from '../../../../../../core/fireux-core/src/runtime/models/profiles/profile.model'
import { createFieldMapper } from '../../../../../../core/fireux-core/src/runtime/utils/fieldMap'

/** Global doc: employers/{uid} */
export interface EmployerCoreProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  bioLong?: string | null
  specialties?: string[]
}

/** App mirror: apps/{appId}/employers/{uid} */
export interface EmployerAppProfile extends ProfileBase {
  name: string
  title?: string | null
  bioShort?: string | null
  specialties?: string[]
}

/** UI props */
export interface EmployerPillProps {
  id: string
  name: string
  avatar: string
  title?: string | null
}
export interface EmployerCellProps extends EmployerPillProps {
  bioShort?: string | null
  specialties?: string[]
}
export interface EmployerProfileProps extends EmployerCellProps {
  bioLong?: string | null
}

/** Mappers */
// UI mappers intentionally omitted in slim model to keep surface minimal.

/** Validation + Config */
export function validateEmployerProfile(
  p: Partial<EmployerCoreProfile>
): boolean {
  return !!p?.name
}

export const employerConfig: ProfileConfig = {
  id: 'employer',
  collectionName: 'employers',
  profileType: 'Employer',
  // validationFn, requiredFields, searchableFields removed in slim ProfileConfig
} as const

// CTA Configuration (kept for compatibility with existing UI)
// CTA config removed from model to keep concerns separate in slim mode.

/** Input / Update */
export type EmployerInput = Omit<
  EmployerCoreProfile,
  'id' | 'created_at' | 'updated_at'
>
export type EmployerUpdate = Partial<EmployerInput>

// Back-compat alias (kept for type stability)
export type Employer = EmployerCoreProfile

// Field mapping: UI camelCase ↔ Firestore snake_case
export const EmployerMapper = createFieldMapper<
  { bioShort?: string | null; bioLong?: string | null },
  Record<string, unknown>
>({
  bioShort: 'bio_short',
  bioLong: 'bio_long',
})
