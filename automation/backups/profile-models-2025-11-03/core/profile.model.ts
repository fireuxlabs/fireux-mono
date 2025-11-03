// @ts-nocheck
// Snapshot of packages/core/fireux-core/src/runtime/models/core/profile.model.ts taken on 2025-11-03
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

  /** Domain-specific metadata (optional per app) */
  domain?: string

  /** Timestamps */
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
