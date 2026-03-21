import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface CleanboxLocationGeo {
  lat: number
  lng: number
}

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Ecosystem-specific root
 * Storage: root/domain runtime model within the Cleanbox ecosystem
 * Root path: cleanbox-owned location records
 * Console use: may be managed by Cleanbox operational surfaces without creating a second overlay by default
 * Transitional fields: still uses `app_id` plus legacy flat `created_at` and `updated_at`
 *
 * Decision note:
 * - This is a Cleanbox-specific root/runtime record, not part of the main shared FireUX root canon yet.
 * - Keep it explicit that this file belongs to an ecosystem domain, not to the global console taxonomy.
 * - If this becomes a shared canonical Place variant later, update the models README first, then this file.
 */
export interface CleanboxLocation {
  id: string
  app_id: string
  agent_id: string | null
  nickname?: string | null
  label: string

  address_line_1?: string | null
  address_line_2?: string | null
  city?: string | null
  postcode?: string | null
  country?: string | null

  geo?: CleanboxLocationGeo | null
  notes?: string | null
  access_code?: string | null
  alarm_code?: string | null

  core_place_id?: string | null

  created_at: FirebaseTimestamp
  updated_at: FirebaseTimestamp
}
