import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type BlogPostType = 'article' | 'product'
export type BlogPublicationScope = 'app' | 'ecosystem'
export type BlogVisibility = 'app' | 'public'
export type BlogPostTranslationStatus = 'draft' | 'review' | 'approved' | 'archived'
export type BlogPostTranslation = { status: BlogPostTranslationStatus; title: string; content: string; metaDescription?: string; keywords?: string[]; tags?: string[]; featuredImage?: string; featuredImageAlt?: string; socialImage?: string; readingTime?: string; cta_text?: string; provenance?: { reviewed_by?: string; reviewed_at?: FirebaseTimestamp } }
export type BlogPostSproochliAttachment = { default_language: string; translations: Record<string, BlogPostTranslation> }
export type BlogEditorialReview = { source_kind: 'human' | 'ai-assisted'; privacy_reviewed: boolean; facts_reviewed: boolean; names_approved: boolean }
export type BlogAuthor = { id: string; display_name: string; avatar: string; handle?: string }

export type BlogPost = FireuxStamped & { id: string; source_app_id: string; visibility: BlogVisibility; publication_scope: BlogPublicationScope; title: string; content: string; metaDescription: string; slug: string; author: BlogAuthor; keywords: string[]; tags: string[]; canonicalUrl: string; featuredImage: string; featuredImageAlt: string; socialImage: string; readingTime: string; cta_link: string; cta_text: string; type: BlogPostType; product_id: string; editorial_review: BlogEditorialReview; sproochli?: BlogPostSproochliAttachment }
export type BlogPostFeedReference = { kind: 'blog-post'; slug: string }
