import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  BlogPostStorage,
  type BlogPost,
  type BlogPostCreateInput,
} from '../../../../../utils/blog-post'
import { normalizeBlogPostCreate } from '../../../../../utils/normalize-blog-post'

export const BlogPayload = {
  slug: '',
  source_app_id: '',
  visibility: 'app',
  publication_scope: 'app',
  title: '',
  content: '',
  metaDescription: '',
  author: {
    id: '',
    display_name: '',
    avatar: '',
    handle: '',
  },
  keywords: [] as string[],
  tags: [] as string[],
  canonicalUrl: '',
  featuredImage: '',
  featuredImageAlt: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'article',
  product_id: '',
  editorial_review: {
    source_kind: 'human',
    privacy_reviewed: false,
    facts_reviewed: false,
    names_approved: false,
  },
  sproochli: undefined,
} satisfies BlogPostCreateInput

export const BlogStampOptions = {
  creator: true,
} as const

export function useBlogCreate() {
  const db = useFirestore()
  const { createDocument: create } = useFirestoreCreate()

  async function createBlogPost(
    payload: BlogPostCreateInput,
    slug: string
  ): Promise<boolean> {
    const validatedSlug = await assertPublicSlug(slug, {
      label: 'Blog post slug',
      namespace: 'blog',
      reservedScope: 'entity',
      isAvailable: async (candidate) => {
        const ref = doc(db, BlogPostStorage.collection, candidate)
        const snap = await getDoc(ref)
        return !snap.exists()
      },
    })

    const fireux = useFireUXConfig()
    const sourceAppId = normalizeString(payload.source_app_id || fireux.appId)
    const data = normalizeBlogPostCreate({
      ...payload,
      slug: validatedSlug,
      source_app_id: sourceAppId,
      visibility: payload.visibility || 'app',
      publication_scope: payload.publication_scope || 'app',
    })

    await create(BlogPostStorage.collection, data as BlogPost, {
      id: validatedSlug,
      creator: true,
    })

    return true
  }

  return { createBlogPost }
}
