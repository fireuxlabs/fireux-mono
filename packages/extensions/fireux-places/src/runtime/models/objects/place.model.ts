// FILE: packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts

import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
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

// 🔑 Runtime + canonical shape for the STORED Firestore Place
export const Place = {
	/** Canonical id (== Google place_id; Firestore document id). */
	id: '',

	name: '',
	formatted_address: '',
	lat: 0,
	lng: 0,

	/** Canonical place image for UI (empty string means unset). */
	place_image: '',

	source: 'firebase' as PlaceSource,

	/** “How we found this place” (kept for UX + duplicate avoidance). */
	search_term: '',

	// Authored (FireuxAuthored)
	creator_id: '',
	created_at: {} as FirebaseTimestamp,
	updated_at: {} as FirebaseTimestamp,
} as const

// ✅ Type derived from the runtime model (stored Place)
export type Place = FireuxAuthored & {
	[K in keyof typeof Place]: (typeof Place)[K]
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
