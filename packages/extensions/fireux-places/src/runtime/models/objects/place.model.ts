/**
 * Place models are shape-only.
 * View models (pill/cell/profile) belong in composables under utils/view.
 */

export type PlaceSource = 'google' | 'firestore'

/**
 * Base (shared by both Google & Firestore)
 */
export interface BasePlace {
  place_id: string
  name: string
  formatted_address: string
  lat: number
  lng: number
  source: PlaceSource
  avatar?: string | null
}

/**
 * Google Place (transient)
 */
export interface GooglePlace extends BasePlace {
  source: 'google'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
}

/**
 * Firestore Place (stored)
 */
export interface Place extends BasePlace {
  source: 'firestore'
  search_term: string
  created_at: any
  updated_at?: any
}
