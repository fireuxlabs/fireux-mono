// FILE: packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * BlogPost Firestore doc (extension)
 * Collection: blogs/{slug}
 *
 * Canon rules:
 * - id is slug (string)
 * - Uses FireuxStamped for created/updated (+ optional creator_id)
 */

export type BlogPostType = 'article' | 'product'

export type BlogAuthor = {
	id: string
	display_name: string
	avatar: string
	handle: string
	email: string
}

export const BlogPost = {
	// Identity
	id: '', // == slug

	// Core content
	title: '',
	content: '',
	metaDescription: '',
	slug: '',

	// Author snapshot
	author: {
		id: '',
		display_name: '',
		avatar: '',
		handle: '',
		email: '',
	} as BlogAuthor,

	// SEO
	keywords: [] as string[],
	tags: [] as string[],
	canonicalUrl: '',

	// Media
	featuredImage: '',
	socialImage: '',

	// Meta
	readingTime: '',
	cta_link: '',
	cta_text: '',

	// Type + optional product link
	type: 'article' as BlogPostType,
	product_id: '',

	// Scope
	appId: '',

	// Stamps
	creator_id: undefined as FireuxStamped['creator_id'],
	created_at: {} as FirebaseTimestamp,
	updated_at: {} as FirebaseTimestamp,
} as const

export type BlogPost = {
	[K in keyof typeof BlogPost]: (typeof BlogPost)[K]
}

export type BlogPostEntry = Omit<
	BlogPost,
	'created_at' | 'updated_at' | 'creator_id'
>
