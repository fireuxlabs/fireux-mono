// Global single-layer Place model with unified card variants

/** ───────────────────────────────
 * Base
 * ─────────────────────────────── */
export interface Place {
  id: string // Firestore doc id = Google place_id
  name: string
  formatted_address: string
  lat: number
  lng: number
  avatar: string // main image (logo, storefront, etc.)
  source: 'firestore' | 'google'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
  created_at: any
  updated_at?: any
}

/** ───────────────────────────────
 * Cards
 * ─────────────────────────────── */
export namespace PlaceCard {
  export interface Pill {
    id: string
    name: string
    avatar?: string | null
  }

  export interface Cell extends Pill {
    formatted_address?: string
    rating?: number | null
    meta_right?: string | null // e.g. “Updated 2h ago”
  }

  export interface Profile extends Cell {
    website?: string | null
    phone?: string | null
    user_ratings_total?: number | null
  }
}
