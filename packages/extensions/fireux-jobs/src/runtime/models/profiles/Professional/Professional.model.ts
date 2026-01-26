// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {
    professionalConfig,
    type CertificationItem,
    type EducationItem,
    type LanguageProficiency,
    type OtherExperienceItem,
    type ProjectItem,
    type RelevantExperienceItem,
    type VolunteeringItem,
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

  languages: [] as LanguageProficiency[],
  certifications: [] as CertificationItem[],
  education: [] as EducationItem[],
  volunteering: [] as VolunteeringItem[],
  projects: [] as ProjectItem[],

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ProfessionalCore = {
  [K in keyof typeof ProfessionalCore]: (typeof ProfessionalCore)[K]
}

export const ProfessionalApp = {
  id: '',

  // Stamps
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type ProfessionalApp = {
  [K in keyof typeof ProfessionalApp]: (typeof ProfessionalApp)[K]
}

export type ProfessionalUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type ProfessionalResolved = ProfessionalCore & {
  user?: User | ProfessionalUserSummary
}

export { professionalConfig }
