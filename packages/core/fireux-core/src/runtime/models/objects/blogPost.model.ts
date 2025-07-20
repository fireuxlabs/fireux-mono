import type { Author } from '../core/appUser.model'
import type { Sluggable } from './protocols'

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
  cta_text: string // ← new
  type: 'article' | 'product'
  product_id?: string
  appId: string
}

// ------------------------------------------------------------------
// Entry type: exactly what the user fills in
// ------------------------------------------------------------------
export type BlogPostEntry = Omit<
  BlogPost,
  'created_at' | 'updated_at' | 'appId'
>

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
