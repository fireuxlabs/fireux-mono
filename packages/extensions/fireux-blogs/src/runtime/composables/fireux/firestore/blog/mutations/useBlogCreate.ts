import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
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

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useBlogCreate() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()

  async function createBlogPost(
    payload: BlogPostEntry,
    slug: string
  ): Promise<boolean> {
    const validatedSlug = await assertPublicSlug(slug, {
      label: 'Blog post slug',
      namespace: 'blog',
      reservedScope: 'entity',
      isAvailable: async (candidate) => {
        const ref = doc(db, 'blogs', candidate)
        const snap = await getDoc(ref)
        return !snap.exists()
      },
    })

    const fireux = useFireUXConfig()
    const sourceAppId = normalizeString(payload.source_app_id || fireux.appId)
    const sourceEcosystemId = normalizeString(payload.source_ecosystem_id || fireux.ecosystem)
    const ownerType = normalizeString(payload.owner_type || (sourceAppId ? 'app' : 'ecosystem'))
    const ownerId = normalizeString(
      payload.owner_id || (ownerType === 'ecosystem' ? sourceEcosystemId : sourceAppId)
    )
    const data = {
      ...payload,
      id: validatedSlug,
      slug: validatedSlug,
      source_app_id: sourceAppId,
      source_ecosystem_id: sourceEcosystemId,
      owner_type: ownerType,
      owner_id: ownerId,
      visibility: payload.visibility || 'app',
    } as Omit<BlogPost, 'created' | 'updated'>

    await setDocument<BlogPost>('blogs', validatedSlug, data as BlogPost, {
      creator: true,
    })

    return true
  }

  return { createBlogPost }
}
