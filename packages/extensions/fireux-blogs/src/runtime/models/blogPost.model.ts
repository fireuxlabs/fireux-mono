// FILE: packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts

import {
  FireuxRootScope,
  type FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model'
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
 * Root scope: filtered by source app / ecosystem / owner fields rather than app-local duplication
 *
 * Decision note:
 * - BlogPost is root canonical truth.
 * - App and ecosystem surfaces should filter root blog posts through shared root scoping fields.
 * - Do not create app-local blog post storage unless real app-local state appears later.
 * - If that changes, update the models README first, then this file.
 */
export const BlogPostModel = {
  id: '',
  ...FireuxRootScope,
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
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['created']['by'],
    app_id: undefined as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined as FireuxStamped['updated']['by'],
  },
} as const

export const BlogPost = BlogPostModel

export type BlogPost = {
  [K in keyof typeof BlogPostModel]: (typeof BlogPostModel)[K]
}

export type BlogPostCreateInput = Omit<BlogPost, 'created' | 'updated'>
export type BlogPostUpdateInput = Partial<
  Omit<BlogPost, 'id' | 'slug' | 'created' | 'updated'>
>
export type BlogPostEntry = BlogPostCreateInput
