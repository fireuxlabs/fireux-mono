// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import {  type CertificationItem,
  type EducationItem,
  type LanguageProficiency,
  type OtherExperienceItem,
  type ProjectItem,
  type RelevantExperienceItem,
  type VolunteeringItem,
} from './supporting'

/**
 * Core doc: professionals/{uid}
 * App doc:  apps/{appId}/professionals/{uid}
 *
 */

export const ProfessionalCore = {
  id: '' as string,

  // Identity 
  title: '' as string,
  summary: '' as string,
  bio: '' as string,
  image: '' as string,

  // Experience 
  relevant_experience: [] as RelevantExperienceItem[],
  other_experience: [] as OtherExperienceItem[],

  // Detail sections (real deal)
  languages: [] as LanguageProficiency[],
  certifications: [] as CertificationItem[],
  education: [] as EducationItem[],
  volunteering: [] as VolunteeringItem[],
  projects: [] as ProjectItem[],

  // Stamps
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
} as const

export type ProfessionalCore = {
  [K in keyof typeof ProfessionalCore]: (typeof ProfessionalCore)[K]
}

export const ProfessionalApp = {
  id: '',

  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
} as const

export type ProfessionalApp = {
  [K in keyof typeof ProfessionalApp]: (typeof ProfessionalApp)[K]
}

export type ProfessionalUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type ProfessionalResolved = ProfessionalCore & {
  user?: User | ProfessionalUserSummary
}
