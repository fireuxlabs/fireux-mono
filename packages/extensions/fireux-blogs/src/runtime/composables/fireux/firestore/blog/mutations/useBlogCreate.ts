import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { BlogPost, BlogPostEntry } from '../../../../../models/blogPost.model'

export const BlogPayload = {
  id: '',
  slug: '',
  source_app_id: '',
  source_ecosystem_id: '',
  owner_type: 'app',
  owner_id: '',
  visibility: 'app',
  title: '',
  content: '',
  metaDescription: '',
  author: {
    id: '',
    display_name: '',
    avatar: '',
    handle: '',
    email: '',
  },
  keywords: [] as string[],
  tags: [] as string[],
  canonicalUrl: '',
  featuredImage: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: '',
  product_id: '',
}

export const BlogStampOptions = {
  creator: true,
} as const

export function useBlogCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function createBlogPost(
    payload: BlogPostEntry,
    slug: string
  ): Promise<boolean> {
    if (!slug) {
      throw new Error('Blog post slug is required')
    }

    const ref = doc(db, 'blogs', slug)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      return false
    }

    const fireux = useFireUXConfig()
    const sourceAppId = String(payload.source_app_id || fireux.appId || '').trim()
    const sourceEcosystemId = String(
      payload.source_ecosystem_id || fireux.ecosystem || ''
    ).trim()
    const ownerType = String(payload.owner_type || (sourceAppId ? 'app' : 'ecosystem')).trim()
    const ownerId = String(
      payload.owner_id || (ownerType === 'ecosystem' ? sourceEcosystemId : sourceAppId)
    ).trim()
    const data = {
      ...payload,
      id: slug,
      slug,
      source_app_id: sourceAppId,
      source_ecosystem_id: sourceEcosystemId,
      owner_type: ownerType,
      owner_id: ownerId,
      visibility: payload.visibility || 'app',
    } satisfies Omit<BlogPost, 'created' | 'updated'>

    await setDocument<BlogPost>('blogs', slug, data as BlogPost, {
      creator: true,
    })
    await upsertSeoIndexDoc('seo_index_blogs', slug, {
      path: `/blog/${slug}`,
      isPublic: true,
    })

    return true
  }

  return { createBlogPost }
}
