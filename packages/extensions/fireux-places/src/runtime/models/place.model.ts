/** ───────────────────────────────
 * Base (shared by both Google & Firestore)
 * ─────────────────────────────── */
export interface BasePlace {
  place_id: string
  name: string
  formatted_address: string
  lat: number
  lng: number
  source: 'google' | 'firestore'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
}

/** ───────────────────────────────
 * Google Place (transient)
 * ─────────────────────────────── */
export interface GooglePlace extends BasePlace {
  source: 'google'
  photo_reference?: string | null
  photo_url?: string | null
}

/** ───────────────────────────────
 * Firestore Place (stored)
 * ─────────────────────────────── */
export interface Place extends BasePlace {
  source: 'firestore'
  avatar?: string | null
  search_term: string
  created_at: any
  updated_at?: any
}

/** ───────────────────────────────
 * Cards (UI)
 * ─────────────────────────────── */
export namespace PlaceCard {
  export interface Pill {
    place_id: string
    name: string
    avatar?: string | null
  }
  export interface Cell extends Pill {
    formatted_address?: string
    rating?: number | null
    meta_right?: string | null // “Saved” | “Google” | etc.
  }
}

/** ───────────────────────────────
 * Helper Mappers
 * ─────────────────────────────── */

// GooglePlace → Firestore Place
export function toStoredPlace(g: GooglePlace): Place {
  const search_term = `${g.name} ${g.formatted_address}`.toLowerCase()
  return {
    ...g,
    source: 'firestore',
    avatar: g.photo_url ?? null,
    search_term,
    created_at: new Date(),
  }
}

// Any place-like → Cell (UI helper)
export function toCell(
  p: BasePlace & { avatar?: string | null }
): PlaceCard.Cell {
  return {
    place_id: p.place_id,
    name: p.name,
    avatar: p.avatar ?? null,
    formatted_address: p.formatted_address,
    rating: p.rating ?? null,
    meta_right: p.source === 'firestore' ? 'Saved' : 'Google',
  }
}
