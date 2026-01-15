// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

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

  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ProfessionalCore = {
  [K in keyof typeof ProfessionalCore]: (typeof ProfessionalCore)[K]
}

export const ProfessionalApp = {
  id: '',
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ProfessionalApp = {
  [K in keyof typeof ProfessionalApp]: (typeof ProfessionalApp)[K]
}

export { professionalConfig }
