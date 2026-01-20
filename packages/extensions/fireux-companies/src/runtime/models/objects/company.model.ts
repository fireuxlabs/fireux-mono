// FILE: packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model';
import type { FirebaseTimestamp } from 'fireux-core/types/firebase';

/**
 * Company overlay (Place-bound)
 * Firestore: companies/{placeId}
 * - Document ID is the canonical Place ID.
 * - This is an overlay on top of an existing Place.
 *
 * Canon strategy:
 * - Runtime object is the single source of truth
 * - TypeScript derives types from it
 * - Drift is detected by comparing data ↔ model shape
 */

// 🔑 Runtime + canonical shape (source of truth)
export const Company = {
  /** Canonical Place ID (also the Firestore document ID). */
  id: '',

  /** Display name */
  name: '',

  /** Canonical address snapshot */
  formatted_address: '',

  /** Canonical location snapshot */
  lat: 0,
  lng: 0,

  /** Canonical place image snapshot (empty string means unset). */
  place_image: '',

  /** Optional website (empty string means unset) */
  website: '',

  /** Search term used for prefix search */
  search_term: '',

  /** Normalized search term (diacritics stripped) */
  search_term_normalized: '',

  /** Optional phone (empty string means unset) */
  phone: '',

  /** Optional email (empty string means unset) */
  email: '',

  /** Optional summary/description */
  summary: '',

  /** Optional badges */
  badges: [] as string[],

  /** Optional social links */
  socials: [] as { name: string; url: string }[],

  /** Optional opening hours (key/value by day) */
  hours: {} as Record<string, string>,

  /** Optional brand color (hex) */
  brand_color: '',

  /** Optional logo variant (light/dark) */
  logo_variant: '',

  /** Optional place source snapshot */
  place_source: '',

  // Authored (FireuxStamped)
  creator_id: undefined as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Company = {
  [K in keyof typeof Company]: (typeof Company)[K]
}

export type CompanyCreateInput = Omit<Company, 'created_at' | 'updated_at' | 'creator_id'>
export type CompanyUpdateInput = Partial<Omit<CompanyCreateInput, 'id'>>
