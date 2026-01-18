import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export interface CleanboxLocationGeo {
  lat: number
  lng: number
}

/**
 * Cleanbox-specific location record describing a serviced property.
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
