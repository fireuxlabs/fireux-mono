// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from './supporting'

export interface ProfessionalCore {
  id: string
  title: string
  summary: string
  bio: string
  image: string
  positions: string[]
  relevant_experience: RelevantExperienceItem[]
  other_experience: OtherExperienceItem[]
  languages: LanguageProficiency[]
  certifications: CertificationItem[]
  education: EducationItem[]
  volunteering: VolunteeringItem[]
  projects: ProjectItem[]
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const ProfessionalCore: ProfessionalCore = {
  id: '',
  title: '',
  summary: '',
  bio: '',
  image: '',
  positions: [],
  relevant_experience: [],
  other_experience: [],
  languages: [],
  certifications: [],
  education: [],
  volunteering: [],
  projects: [],
  created: { at: {} as FirebaseTimestamp, by: undefined },
  updated: { at: {} as FirebaseTimestamp, by: undefined },
}

export interface ProfessionalApp {
  id: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const ProfessionalApp: ProfessionalApp = {
  id: '',
  created: { at: {} as FirebaseTimestamp, by: undefined },
  updated: { at: {} as FirebaseTimestamp, by: undefined },
}

export type ProfessionalUserSummary = Pick<User, 'id' | 'display_name' | 'avatar'> &
  Partial<Pick<User, 'handle' | 'email'>>

export type ProfessionalResolved = ProfessionalCore & {
  user?: User | ProfessionalUserSummary
}
