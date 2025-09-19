// packages/core/fireux-core/src/runtime/models/profiles/profile.model.ts
import type { FirebaseTimestamp } from '../../types/firebase'

/**
 * Minimal, shared base for any profile (chef, supplier, professional, employer, etc.)
 * This is the Firestore document shape (strict).
 */
export interface ProfileBase {
  /** Canonical id (== Firebase Auth UID & Firestore doc id) */
  id: string

  /** Display name for the profile */
  display_name: string

  /** Primary avatar URL to display everywhere */
  avatar: string

  /** Timestamps */
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

/**
 * Config definition to describe a profile type.
 */
export interface ProfileConfig {
  /** Lowercase singular identifier: 'chef', 'employer', 'professional', 'supplier' */
  id: string

  /** Firestore collection name, e.g. 'chefs', 'professionals' */
  collectionName: string

  /** Human-readable type label, e.g. 'Chef', 'Employer' */
  profileType: string

  /**
   * Optional hook to attach role-specific update composables.
   * Should return an object with update methods to be spread onto useProfile() return value.
   */
  updateComposable?: () => Record<string, any>
}
