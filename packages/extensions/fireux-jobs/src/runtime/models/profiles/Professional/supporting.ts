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
  role?: string
  from_month?: string
  from_year?: string
  to_month?: string | null
  to_year?: string | null
  ongoing?: boolean
  responsibilities?: string
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
  place_id?: string
  name: string
  formatted_address?: string
  short_address?: string
  image_url?: string | null
}

/** Combined union if needed elsewhere */
export type ExperienceItem = RelevantExperienceItem | OtherExperienceItem

/* ---------------------------------- *
 * Professional Profile Config
 * ---------------------------------- */

import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'

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
