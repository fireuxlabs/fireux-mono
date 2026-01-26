// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts

/**
 * Domain-level supporting structures for Professional profiles.
 * These stay separate from the UI-facing ProfessionalCard namespace
 * to keep the domain clean and future-proof.
 */

/* ---------------------------------- *
 * Experience Base Types
 * ---------------------------------- */

/** Minimal shared structure for any experience entry */
export interface ExperienceBase {
  role: string
  from_month: string
  from_year: string
  to_month: string
  to_year: string
  ongoing: boolean
  responsibilities: string
}

/**
 * Experience linked to a canonical Place in Firestore.
 * places/{place_id}
 */
export interface RelevantExperienceItem extends ExperienceBase {
  place_id: string
}

/**
 * Experience referencing an external place snapshot.
 * Self-contained. Useful when the place isn't in Firestore yet.
 */
export interface OtherExperienceItem extends ExperienceBase {
  place_id: string
  name: string
  formatted_address: string
  short_address: string
  image_url: string
}

/** Combined union if needed elsewhere */
export type ExperienceItem = RelevantExperienceItem | OtherExperienceItem

/* ---------------------------------- *
 * Profile detail structures
 * ---------------------------------- */

type YearValue = string | number | null

export interface LanguageProficiency {
  language: string
  proficiency: string
}

export interface CertificationItem {
  name: string
  year: YearValue
  place_name: string
  formatted_address: string
  document_url: string
  image_url: string
}

export interface EducationItem {
  institution: string
  degree: string
  start_year: YearValue
  end_year: YearValue
  ongoing: boolean
  formatted_address: string
  document_url: string
  image_url: string
}

export interface VolunteeringItem {
  organization: string
  role: string
  from_year: YearValue
  to_year: YearValue
  ongoing: boolean
  responsibilities: string
}

export interface ProjectItem {
  name: string
  role: string
  from_year: YearValue
  to_year: YearValue
  ongoing: boolean
  responsibilities: string
}

/* ---------------------------------- *
 * Professional Profile Config
 * ---------------------------------- */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model'

/**
 * Runtime config consumed by useProfile()
 * Profiles live under: professionals/{uid}
 */
export const professionalConfig: ProfileConfig = {
  id: 'professional',
  collectionName: 'professionals',
  profileType: 'Professional',
  cta: 'Create your Professional profile to appear in listings.',
  navLabel: 'Professional',
  navIcon: 'i-lucide-user-star',
} as const
