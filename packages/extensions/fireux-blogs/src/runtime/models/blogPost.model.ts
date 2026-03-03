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

export interface BlogPost {
  id: string
  title: string
  content: string
  metaDescription: string
  slug: string
  author: BlogAuthor
  keywords: string[]
  tags: string[]
  canonicalUrl: string
  featuredImage: string
  socialImage: string
  readingTime: string
  cta_link: string
  cta_text: string
  type: BlogPostType
  product_id?: string
  appId: string
  // Transitional flat stamps still consumed in blog composables.
  created_at?: string
  updated_at?: string
  created: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
  updated: {
    at: FirebaseTimestamp
    by?: FireuxStamped['created']['by']
  }
}

export const BlogPost: BlogPost = {
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
  },
  keywords: [],
  tags: [],
  canonicalUrl: '',
  featuredImage: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'article',
  product_id: '',
  appId: '',
  created_at: '',
  updated_at: '',
  created: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: undefined,
  },
}

export type BlogPostEntry = Omit<BlogPost, 'created' | 'updated'>
