// FILE: packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts

import type { FireuxAuthored } from 'fireux-core/runtime/models/core/meta.model'

/**
 * Places canon:
 * - GooglePlace = transient provider result (never written to Firestore)
 * - Place = stored Firestore document in `/places/{id}`
 * - `id` is always the Google place_id and also the Firestore doc id
 * - Empty string means "unset"
 */

/** Canonical sources are 'google' (provider/transient) and 'firebase' (stored). */
export type PlaceSource = 'google' | 'firebase'

/** Base (shared by Google & Firestore). */
export interface BasePlace {
	/** Canonical id (== Google place_id; Firestore document id). */
	id: string

	name: string
	formatted_address: string
	lat: number
	lng: number

	/** A display image for UI (empty string means unset). */
	image_url: string

	source: PlaceSource
}

/** Google Place (transient/provider). */
export interface GooglePlace extends BasePlace {
	source: 'google'

	/** Useful to confirm identity before saving. */
	website: string
	phone: string
	rating: number
	user_ratings_total: number
}

/** Firestore Place (stored). */
export interface Place extends BasePlace, FireuxAuthored {
	source: 'firebase'

	/** “How we found this place” (kept for UX + duplicate avoidance). */
	search_term: string
}

/** Payload used before Firestore stamping is applied. */
export type PlaceUpsertInput = Omit<Place, 'creator_id' | 'created_at' | 'updated_at'>
