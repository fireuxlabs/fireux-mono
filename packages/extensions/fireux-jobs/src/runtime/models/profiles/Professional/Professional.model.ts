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

export type ProfessionalCoreShape = {
  id: string
  title: string
  subtitle: string
  tagline: string
  tags: string[]

  health_certifications: string[]
  bio_short: string
  bio_long: string
  specialties: string[]
  locations: string[]
  relevant_experience: RelevantExperienceItem[]
  other_experience: OtherExperienceItem[]

  creator_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const ProfessionalCore: ProfessionalCoreShape = {
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
}

export type ProfessionalCore = ProfessionalCoreShape

export type ProfessionalAppShape = {
  id: string
  creator_id: string
  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}

export const ProfessionalApp: ProfessionalAppShape = {
  id: '',
  creator_id: '',
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
}

export type ProfessionalApp = ProfessionalAppShape

export { professionalConfig }
