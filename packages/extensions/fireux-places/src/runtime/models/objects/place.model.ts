// FILE: packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts

import type { FireuxAuthored } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Places canon:
 * - GooglePlace = transient provider result (never written to Firestore)
 * - Place = stored Firestore document in `/places/{id}`
 * - `id` is always the Google place_id and also the Firestore doc id
 * - Empty string means "unset"
 */

/** Canonical sources: google (provider), fireux (stored), manual (user-entered). */
export type PlaceSource = 'google' | 'fireux' | 'manual'

export interface Place extends FireuxAuthored {
	/** Canonical id (== Google place_id; Firestore document id). */
	id: string

	name: string
	formatted_address: string
	lat: number
	lng: number

	/** Canonical place image for UI (empty string means unset). */
	place_image: string

	/** User id that has claimed this place (empty string means unclaimed). */
	claimed_by: string

	source: PlaceSource

	/** “How we found this place” (kept for UX + duplicate avoidance). */
	search_term: string
}

// 🔑 Runtime + canonical shape for the STORED Firestore Place
export const Place: Place = {
	/** Canonical id (== Google place_id; Firestore document id). */
	id: '',

	name: '',
	formatted_address: '',
	lat: 0,
	lng: 0,

	/** Canonical place image for UI (empty string means unset). */
	place_image: '',

	/** User id that has claimed this place (empty string means unclaimed). */
	claimed_by: '',

	// Drift validation uses enum:... markers in runtime models.
	source: 'enum:google|fireux|manual' as unknown as PlaceSource,

	/** “How we found this place” (kept for UX + duplicate avoidance). */
	search_term: '',

	// Authored (FireuxAuthored)
	creator_id: '',
	created_at: {} as FirebaseTimestamp,
	updated_at: {} as FirebaseTimestamp,
}

/** Base (shared by Google & Firestore). */
export type BasePlace = Pick<
	Place,
	'id' | 'name' | 'formatted_address' | 'lat' | 'lng' | 'place_image' | 'source'
>

/** Google Place (transient/provider). */
export type GooglePlace = BasePlace & {
	source: 'google'

	/** Useful to confirm identity before saving. */
	website: string
	phone: string
	rating: number
	user_ratings_total: number
}

/** Payload used before Firestore stamping is applied. */
export type PlaceUpsertInput = Omit<Place, keyof FireuxAuthored>
