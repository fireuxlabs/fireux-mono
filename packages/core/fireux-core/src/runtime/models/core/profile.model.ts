import type { User } from './user.model'

/**
 * Minimal shared Profile shape.
 * Each profile belongs to a user and represents a domain entity
 * like Chef, Supplier, Agent, or Professional.
 */
export interface Profile {
  /** Canonical Firestore id (== Firebase Auth UID) */
  id: string

  /** Reference to the owning user (minimal core surface) */
  user: Partial<User>

  /** Domain id (e.g. 'chef', 'supplier', etc.) */
  domain: string

  /** Main title for pill or card (e.g. 'Freelance Chef', 'Catering Agency') */
  title: string

  /** Secondary subtitle for pill or card (e.g. 'Zürich, Switzerland') */
  subtitle: string

  /** Badges (skills, tags, specialties, etc.) */
  badges: string[]
}

/**
 * Generic wrapper shape used by system-domain composables.
 *
 * Notes:
 * - This is *shape only* (no domain props).
 * - UI card/pill/profile view models are produced by `useXInterface` composables.
 * - `core` and `app` are the Firestore-backed documents (core + optional tenant overlay).
 */
export interface DomainProfile<TCore extends Profile, TApp extends Profile> {
  id: string
  display_name: string
  avatar: string
  core: TCore
  app: TApp
}

/**
 * Config describing how a profile collection behaves.
 */
export interface ProfileConfig {
  /** Lowercase identifier like 'chef', 'supplier', 'agent', 'professional' */
  id: string

  /** Firestore collection name */
  collectionName: string

  /** Human-readable label */
  profileType: string

  /** CTA text for UI when profile missing */
  cta: string

  /** Label override for nav/dropdown contexts */
  navLabel: string

  /** Icon to reuse across nav/dropdown contexts */
  navIcon: string
}
