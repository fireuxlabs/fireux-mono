import type { FirebaseTimestamp } from '../../types/firebase.ts'
import type { User } from './user.model.ts'

/**
 * Minimal shared Profile shape.
 * Each profile belongs to a user and represents a domain entity
 * like Chef, Supplier, Employer, or Professional.
 */
export interface Profile {
  /** Canonical Firestore id (== Firebase Auth UID) */
  id: string

  /** Reference to the owning user (can be a full User or pill later) */
  user: Partial<User>

  /** Optional domain (e.g. 'chef', 'supplier', etc.) */
  domain?: string

  /** Main title for pill or card (e.g. 'Freelance Chef', 'Catering Agency') */
  title?: string | null

  /** Secondary subtitle for pill or card (e.g. 'Zürich, Switzerland') */
  subtitle?: string | null

  /** Optional badges (skills, tags, specialties, etc.) */
  badges?: string[]

  /** Creation and update timestamps */
  created_at: FirebaseTimestamp
  updated_at?: FirebaseTimestamp
}

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Lowercase identifier like 'chef', 'supplier', 'employer', 'professional' */
  id: string

  /** Firestore collection name */
  collectionName: string

  /** Human-readable label */
  profileType: string

  /** Optional CTA text for UI when profile missing */
  cta?: string
}
