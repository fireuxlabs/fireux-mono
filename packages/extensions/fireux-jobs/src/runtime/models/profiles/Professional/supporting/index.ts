// FILE: packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting/index.ts

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
 *
 * RULE:
 * - Anything using the Places API stores ONLY place_id.
 * - Display data is hydrated from places/{place_id}.
 */
export interface ExperienceItem extends ExperienceBase {
  place_id: string
  place_collection: string
}

/** Separate aliases for UI sections (same shape). */
export type RelevantExperienceItem = ExperienceItem
export type OtherExperienceItem = ExperienceItem

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
