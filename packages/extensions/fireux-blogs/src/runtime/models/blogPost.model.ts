// FILE: packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts
import { FireuxRootScope } from 'fireux-core/runtime/models/utils/scope.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type BlogPostType = 'article' | 'product'
export type BlogPublicationScope = 'app' | 'ecosystem'
export type BlogPostTranslationStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'archived'

export type BlogPostTranslation = {
  status: BlogPostTranslationStatus
  title: string
  content: string
  metaDescription?: string
  keywords?: string[]
  tags?: string[]
  featuredImage?: string
  featuredImageAlt?: string
  socialImage?: string
  readingTime?: string
  cta_text?: string
  provenance?: {
    reviewed_by?: string
    reviewed_at?: FirebaseTimestamp
  }
}

export type BlogPostSproochliAttachment = {
  default_language: string
  translations: Record<string, BlogPostTranslation>
}

export type BlogEditorialReview = {
  source_kind: 'human' | 'ai-assisted'
  privacy_reviewed: boolean
  facts_reviewed: boolean
  names_approved: boolean
}

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
  featuredImageAlt: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'article' as BlogPostType,
  product_id: '',
  editorial_review: {
    source_kind: 'human',
    privacy_reviewed: false,
    facts_reviewed: false,
    names_approved: false,
  } as BlogEditorialReview,
  sproochli: undefined as BlogPostSproochliAttachment | undefined,
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
