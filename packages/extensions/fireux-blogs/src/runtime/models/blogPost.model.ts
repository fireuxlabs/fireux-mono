// FILE: packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type BlogPostType = 'article' | 'product'

export type BlogAuthor = {
  id: string
  display_name: string
  avatar: string
  handle?: string
  email?: string
}

/**
 * Entity Class: Root
 * Canonical Path: /blogs/<slug>
 */
export const BlogPost = {
  id: '',
  title: '',
  content: '',
  metaDescription: '',
  slug: '',
  author: {
    id: '',
    display_name: '',
    avatar: '',
    handle: '',
    email: '',
  } as BlogAuthor,
  keywords: [] as string[],
  tags: [] as string[],
  canonicalUrl: '',
  featuredImage: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'article' as BlogPostType,
  product_id: '',
  appId: '',
  // Legacy transitional fields still read/written by existing surfaces.
  created_at: '',
  updated_at: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export type BlogPost = {
  [K in keyof typeof BlogPost]: (typeof BlogPost)[K]
}

export type BlogPostCreateInput = Omit<BlogPost, 'created' | 'updated'>
export type BlogPostUpdateInput = Partial<Omit<BlogPostCreateInput, 'id' | 'slug'>>
export type BlogPostEntry = BlogPostCreateInput
