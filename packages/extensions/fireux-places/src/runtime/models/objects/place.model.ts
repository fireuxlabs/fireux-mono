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

/** For logo legibility on UI backgrounds. */
export type PlaceImageShade = 'light' | 'dark' | 'none'

export type PlaceSocialLinks = {
	website: string
	instagram: string
	facebook: string
	tiktok: string
	linkedin: string
	youtube: string
}

export type PlaceAddress = {
	street: string
	city: string
	region: string
	postal_code: string
	country_code: string
}

/**
 * 🔑 Runtime + canonical shape for the STORED Firestore Place
 * Keep everything defaulted so migrations are painless.
 */
export const Place = {
	id: '' as string,

	// Primary identity
	name: '' as string,
	short_name: '' as string,
	brand_tagline: '' as string,
	about: '' as string,

	// Address + geo
	formatted_address: '' as string,
	short_address: '' as string,
	address: {
		street: '',
		city: '',
		region: '',
		postal_code: '',
		country_code: '',
	} as PlaceAddress,
	lat: 0 as number,
	lng: 0 as number,
	timezone: '' as string,

	// Media
	image_url: '' as string, // logo / primary
	cover_image: '' as string, // hero banner (optional)
	gallery_images: [] as string[],
	image_shade: 'none' as PlaceImageShade,

	// Contact + presence
	phone: '' as string,
	email: '' as string,
	website: '' as string,
	google_maps_url: '' as string,
	social_links: {
		website: '',
		instagram: '',
		facebook: '',
		tiktok: '',
		linkedin: '',
		youtube: '',
	} as PlaceSocialLinks,

	// Classification
	types: [] as string[], // e.g. ['restaurant','cafe']
	tags: [] as string[], // FireUX UX tags

	// Simple “signals” (nice for UI; optional data can remain empty)
	rating: 0 as number,
	rating_count: 0 as number,
	price_level: '' as string, // e.g. 'cheap' | 'mid' | 'premium' (keep free-form)

	// Hours (MVP-friendly)
	hours_text: [] as string[], // e.g. ['Mon–Fri 09:00–18:00', 'Sat 10:00–16:00']

	/** Claimed owner (uid); empty string means unclaimed. */
	claimed_by: '' as string,
	verified: false as boolean,

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
	| 'id'
	| 'name'
	| 'short_name'
	| 'formatted_address'
	| 'short_address'
	| 'lat'
	| 'lng'
	| 'image_url'
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
