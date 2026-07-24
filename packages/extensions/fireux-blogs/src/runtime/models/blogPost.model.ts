// FILE: packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts
// Concurrent edit — 2026-07-21 16:39 CEST — Misebox dev stability pass: make server-reachable workspace runtime value imports explicit.

import {
  FireuxRootScope,
  type FireuxStamped,
} from 'fireux-core/runtime/models/core/meta.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type BlogPostType = 'article' | 'product'
export type BlogPublicationScope = 'app' | 'ecosystem'

type WidenLiteral<T> =
  T extends string ? string
  : T extends number ? number
  : T extends boolean ? boolean
  : T extends readonly (infer U)[] ? WidenLiteral<U>[]
  : T extends Record<string, unknown> ? { -readonly [K in keyof T]: WidenLiteral<T[K]> }
  : T

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
export const BlogPostStorage = {
  shape: 'public/root',
  path: 'blogs/{slug}',
  collection: 'blogs',
  idParam: 'slug',
} as const

export const BlogPostModel = {
  id: '',
  ...FireuxRootScope,
  publication_scope: 'app' as BlogPublicationScope,
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

export type BlogPost = WidenLiteral<typeof BlogPostModel>

export type BlogPostCreateInput = Omit<BlogPost, 'created' | 'updated'>
export type BlogPostUpdateInput = Partial<
  Omit<BlogPost, 'id' | 'slug' | 'created' | 'updated'>
>

/**
 * Lightweight feed events may reference canonical Blog truth without copying
 * it. Feed-only events simply omit this reference.
 */
export type BlogPostFeedReference = {
  kind: 'blog-post'
  slug: string
}
