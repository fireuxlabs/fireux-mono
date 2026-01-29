// FILE: packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Place (canonical location)
 * Firestore: places/{id}
 *
 * Canon rules:
 * - id is Google place_id when sourced from Google
 * - manual places also use id as doc id (not google)
 */

/** Canonical sources: google (provider), fireux (stored), manual (user-entered). */
export type PlaceSource = 'google' | 'fireux' | 'manual'

export type PlaceImageShade = 'light' | 'dark' | 'none'

// 🔑 Runtime + canonical shape for the STORED Firestore Place
export const Place = {
	id: '' as string,

	name: '' as string,
	short_name: '' as string,
	formatted_address: '' as string,
	short_address: '' as string,
	lat: 0 as number,
	lng: 0 as number,

	place_image: '' as string,
	image_shade: 'none' as PlaceImageShade,

	/** Claimed owner (uid); empty string means unclaimed. */
	claimed_by: '' as string,

	source: 'enum:google|fireux|manual' as unknown as PlaceSource,

	/** “How we found this place” (kept for UX + duplicate avoidance). */
	search_term: '' as string,

	// Stamps
	creator_id: undefined as FireuxStamped['creator_id'],
	created_at: {} as FirebaseTimestamp,
	updated_at: {} as FirebaseTimestamp,
} as const

export type Place = {
	[K in keyof typeof Place]: (typeof Place)[K]
}

/** Base (shared by Google & Firestore). */
export type BasePlace = Pick<
	Place,
	'id'
	| 'name'
	| 'short_name'
	| 'formatted_address'
	| 'short_address'
	| 'lat'
	| 'lng'
	| 'place_image'
	| 'image_shade'
	| 'claimed_by'
	| 'source'
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
export type PlaceUpsertInput = Omit<Place, 'created_at' | 'updated_at' | 'creator_id'>
