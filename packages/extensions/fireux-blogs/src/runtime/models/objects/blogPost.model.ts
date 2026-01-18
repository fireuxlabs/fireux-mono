// FILE: packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts

// Author identity comes from CoreUser (do not import from AppUser)
import type { Sluggable } from 'fireux-core/runtime/models/shared/protocols.ts'

// ------------------------------------------------------------------
// Author & full BlogPost
// ------------------------------------------------------------------
export interface BlogPost extends Sluggable {
	title: string
	content: string
	metaDescription: string
	slug: string
	created_at: string
	updated_at: string
	author: Author
	keywords: string[]
	tags: string[]
	canonicalUrl: string
	featuredImage: string
	socialImage: string
	readingTime: string
	cta_link: string
	cta_text: string
	type: 'article' | 'product'
	product_id?: string
	appId: string
}

// ------------------------------------------------------------------
// Entry type: exactly what the user fills in
// ------------------------------------------------------------------
export type BlogPostEntry = Omit<BlogPost, 'created_at' | 'updated_at' | 'appId'>

// ------------------------------------------------------------------
// Simplified BlogPost interface
// ------------------------------------------------------------------
export interface SimpleBlogPost {
	title: string
	content: string
	author: string
	createdAt: Date
	updatedAt?: Date
}

export interface Author {
	id: string
	display_name: string
	avatar?: string
	handle?: string
	email?: string
}
