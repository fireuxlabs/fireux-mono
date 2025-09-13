import type { FirebaseTimestamp } from '../../types/firebase'

/**
 * Minimal, shared base for any profile (chef, supplier, professional, employer, etc.)
 */
export interface ProfileBase {
  /** Canonical id (== Firebase Auth UID & Firestore doc id) */
  id: string

  /** Primary avatar URL to display everywhere */
  avatar: string

  /** Optional metadata if/when you need it */
  avatar_meta?: {
    width?: number
    height?: number
    mime?: string
    source?: 'upload' | 'provider' | 'default'
  }

  /** Timestamps */
  created_at: string | Date | FirebaseTimestamp
  updated_at?: string | Date | FirebaseTimestamp
}

/**
 * Input when creating a new profile doc (timestamps are auto-generated)
 */
export type ProfileCreate<T extends ProfileBase> = Omit<
  T,
  'created_at' | 'updated_at'
>

/**
 * Input when updating a profile doc (id and created_at are immutable)
 */
export type ProfileUpdate<T extends ProfileBase> = Partial<
  Omit<T, 'id' | 'created_at'>
>

/**
 * Optional config definition to describe a profile type.
 * Useful for generic handling in UI/composables.
 */
export interface ProfileConfig {
  /** Lowercase singular identifier: 'chef', 'employer', 'professional', 'supplier' */
  id: string

  /** Firestore collection name, e.g. 'chefs', 'professionals' */
  collectionName: string

  /** Human-readable type label, e.g. 'Chef', 'Employer' */
  profileType: string

  /** Domain color (UI) */
  color?: string

  /** Optional composables for lifecycle operations */
  updateComposable?: () => any
  createComposable?: () => any
  deleteComposable?: () => any

  /** Validation & schema hints */
  validationFn?: (profile: any) => boolean
  requiredFields?: string[]
  searchableFields?: string[]
  defaultValues?: Record<string, any>
}

// ---------------------------------------------------------------------------
// Back-compat aliases (safe to remove after refactor completes)
// ---------------------------------------------------------------------------
export type Profile = ProfileBase
export interface ProfileImage {
  url: string
  width?: number
  height?: number
  alt?: string
  mimeType?: string
  dominantColor?: string
  blurDataURL?: string
}
export type ProfileInput<T extends ProfileBase> = ProfileCreate<T>
