// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
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

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Identity
 * Storage: root canonical record plus app overlay
 * Root path: /professionals/<userId>
 * Overlay path: /apps/<appId>/professionals/<userId>
 *
 * Decision note:
 * - Professional is an identity profile first, with scoped truth added only when an app really owns operational state.
 * - Keep the overlay minimal until a real app-specific need appears.
 * - If that changes later, update the models README first, then this file.
 */
export const ProfessionalModel = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  summary: '',
  bio: '',
  image: '',
  positions: [] as string[],
  tags: [] as string[],
  relevant_experience: [] as RelevantExperienceItem[],
  other_experience: [] as OtherExperienceItem[],
  languages: [] as LanguageProficiency[],
  certifications: [] as CertificationItem[],
  education: [] as EducationItem[],
  volunteering: [] as VolunteeringItem[],
  projects: [] as ProjectItem[],
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type Professional = {
  [K in keyof typeof ProfessionalModel]: (typeof ProfessionalModel)[K]
}

export const AppProfessionalModel = {
  id: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type AppProfessional = {
  [K in keyof typeof AppProfessionalModel]: (typeof AppProfessionalModel)[K]
}

export type ProfessionalCreateInput = Omit<Professional, 'id' | 'created' | 'updated'>
export type ProfessionalUpdateInput = Partial<Omit<Professional, 'id' | 'created' | 'updated'>>
