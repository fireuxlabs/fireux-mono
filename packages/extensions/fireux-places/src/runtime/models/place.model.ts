/**
 * Canonical Place models for `fireux-places`.
 *
 * Firestore:
 * - Collection: /places (or type-scoped collection paths via this extension)
 * - Document id: `Place.id` (== Google place_id)
 *
 * Notes:
 * - We do NOT store both `id` and `place_id` on documents.
 * - Canonical identifier is `id` only.
 */

/** Canonical sources are 'google' (provider/transient) and 'firebase' (stored). */
export type PlaceSource = 'google' | 'firebase'
/**
 * Base (shared by Google & Firestore)
 */
export interface BasePlace {
	/** Canonical id (== Google place_id; Firestore document id) */
	id: string

	name: string
	formatted_address: string
	lat: number
	lng: number
	source: PlaceSource
	avatar?: string | null
}

/** Google Place (transient/provider) */
export interface GooglePlace extends BasePlace {
	source: 'google'
	website?: string | null
	phone?: string | null
	rating?: number | null
	user_ratings_total?: number | null
}

/** Firestore Place (stored) */
export interface Place extends BasePlace {
	id: string
	source: 'firebase'

	name: string
	formatted_address: string
	lat: number
	lng: number

	avatar: string

	search_term: string
	creator_id: string

	created_at: any
	updated_at: any
}

/** Payload used before Firestore stamping is applied. */
export type PlaceUpsertInput = Omit<Place, 'creator_id' | 'created_at' | 'updated_at'>
