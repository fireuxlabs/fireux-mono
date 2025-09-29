import type { FirebaseTimestamp } from '../types/firebase'

/**
 * Minimal, shared base for any profile document (core or app).
 * Enforces display_name + avatar + timestamps.
 */
export interface ProfileBase {
  /** Canonical id (== Firebase Auth UID & Firestore doc id) */
  id: string

  /** Display name to show in UI (never fallback to email in storage) */
  display_name: string

  /** Primary avatar URL to display everywhere */
  avatar: string

  /** Timestamps */
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/**
 * Slim config to describe a profile type.
 * Kept tiny so components/composables don’t drift.
 */
export interface ProfileConfig {
  /** Lowercase singular identifier: 'chef', 'supplier', 'professional', 'employer' */
  id: string

  /** Firestore collection name, e.g. 'chefs', 'professionals' */
  collectionName: string

  /** Human-readable type label, e.g. 'Chef', 'Supplier' */
  profileType: string

  /** Optional CTA text when profile is missing (used by ProfileRoot/UI) */
  cta?: string
}
