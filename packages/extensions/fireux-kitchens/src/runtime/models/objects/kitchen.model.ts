export type KitchenSource = 'firestore'

export interface Kitchen {
  /** Optional Firestore doc id (added by Firestore manager if missing) */
  id?: string

  /** If sourced from Google Places, this is the stable external ID */
  place_id?: string

  name: string
  formatted_address?: string
  lat?: number
  lng?: number
  avatar?: string | null

  source: KitchenSource

  created_at?: any
  updated_at?: any
}
