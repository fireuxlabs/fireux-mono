// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

import type { AppProfileBase, CoreProfileBase } from 'fireux-core/runtime/models/core/profile.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
  professionalConfig,
  type OtherExperienceItem,
  type RelevantExperienceItem,
} from './supporting'

/**
 * Runtime canonical shapes (core + app overlay)
 * Core doc:  professionals/{uid}
 * App doc:   apps/{appId}/professionals/{uid}
 */

export type ProfessionalCoreShape = CoreProfileBase & {
  health_certifications: string[]
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  relevant_experience: RelevantExperienceItem[]
  other_experience: OtherExperienceItem[]
}

export const ProfessionalCore = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  tags: [] as string[],

  health_certifications: [] as string[],
  bio_short: '',
  bio_long: '',
  specialties: [] as string[],
  locations: [] as string[],
  relevant_experience: [] as RelevantExperienceItem[],
  other_experience: [] as OtherExperienceItem[],

  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies ProfessionalCoreShape & Record<string, unknown>

export type ProfessionalCore = ProfessionalCoreShape

export type ProfessionalAppShape = AppProfileBase

export const ProfessionalApp = {
  id: '',
  creator_id: undefined,
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} satisfies ProfessionalAppShape & Record<string, unknown>

export type ProfessionalApp = ProfessionalAppShape

export { professionalConfig }
