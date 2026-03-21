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
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root-first canonical model
 * Root path: /blogs/<slug>
 * Console use: may be authored or managed through a console, but does not need a stored overlay by default
 * Transitional fields: legacy `appId`, `created_at`, and `updated_at` still remain in the stored shape
 *
 * Decision note:
 * - BlogPost is treated as a root entity first, but the current stored shape still carries app-coupled transitional fields.
 * - Keep those fields only while existing runtime surfaces still depend on them.
 * - If app-scoped stored truth appears later, add it intentionally rather than by symmetry.
 * - If that changes, update the models README first, then this file.
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
