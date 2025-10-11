/** ───────────────────────────────
 * Base (shared by both Google & Firestore)
 * ─────────────────────────────── */
export type PlaceSource = 'google' | 'firestore'

export interface BasePlace {
  place_id: string
  name: string
  formatted_address: string
  lat: number
  lng: number
  source: PlaceSource
  avatar?: string | null
}

/** ───────────────────────────────
 * Google Place (transient)
 * ─────────────────────────────── */
export interface GooglePlace extends BasePlace {
  source: 'google'
  website?: string | null
  phone?: string | null
  rating?: number | null
  user_ratings_total?: number | null
}

/** ───────────────────────────────
 * Firestore Place (stored)
 * ─────────────────────────────── */
export interface Place extends BasePlace {
  source: 'firestore'
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
    source: PlaceSource
    formatted_address?: string
  }
}

/** ───────────────────────────────
 * Helper Mappers
 * ─────────────────────────────── */

// GooglePlace → Firestore Place
export function toStoredPlace(g: GooglePlace): Place {
  const search_term = `${g.name} ${g.formatted_address}`.toLowerCase()
  return {
    place_id: g.place_id,
    name: g.name,
    formatted_address: g.formatted_address,
    lat: g.lat,
    lng: g.lng,
    source: 'firestore',
    avatar: g.avatar ?? null,
    search_term,
    created_at: new Date(),
  }
}

// Any place-like → Cell (UI)
export function toCell(p: BasePlace): PlaceCard.Cell {
  return {
    place_id: p.place_id,
    name: p.name,
    avatar: p.avatar ?? null,
    source: p.source,
    formatted_address: p.formatted_address,
  }
}
