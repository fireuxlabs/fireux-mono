import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { BlogPost } from '../models/blogPost.model'

export type * from '../models/blogPost.model'
export const BlogPostStorage = { shape: 'public/root', path: 'blogs/{slug}', collection: 'blogs', idParam: 'slug' } as const
export const BlogPostDefaults: BlogPost = { id: '', source_app_id: '', visibility: 'app', publication_scope: 'app', title: '', content: '', metaDescription: '', slug: '', author: { id: '', display_name: '', avatar: '', handle: '' }, keywords: [], tags: [], canonicalUrl: '', featuredImage: '', featuredImageAlt: '', socialImage: '', readingTime: '', cta_link: '', cta_text: '', type: 'article', product_id: '', editorial_review: { source_kind: 'human', privacy_reviewed: false, facts_reviewed: false, names_approved: false }, sproochli: undefined, created: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['created']['by'], app_id: undefined as FireuxStamped['created']['app_id'] }, updated: { at: {} as FirebaseTimestamp, by: undefined as FireuxStamped['updated']['by'] } }
export type BlogPostCreateInput = Omit<BlogPost, 'id' | 'created' | 'updated'>
export type BlogPostUpdateInput = Partial<Omit<BlogPost, 'id' | 'slug' | 'created' | 'updated'>>
