import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreClientCreate } from 'fireux-core/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { defineRuntimeClientCreateTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { assertPublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  BlogPostStorage,
  type BlogPost,
  type BlogPostCreateInput,
} from '../../../../../models/blogPost.model'

export const BlogPayload = {
  id: '',
  slug: '',
  source_app_id: '',
  source_ecosystem_id: '',
  owner_type: 'app',
  owner_id: '',
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
  const create = useFirestoreClientCreate()

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
    const sourceEcosystemId = normalizeString(
      payload.source_ecosystem_id || fireux.ecosystemId
    )
    const ownerType = normalizeString(
      payload.owner_type || (sourceAppId ? 'app' : 'ecosystem')
    )
    const ownerId = normalizeString(
      payload.owner_id ||
        (ownerType === 'ecosystem' ? sourceEcosystemId : sourceAppId)
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
      publication_scope: payload.publication_scope || 'app',
    } as Omit<BlogPost, 'created' | 'updated'>

    await create(
      defineRuntimeClientCreateTarget(
        'project.blog-posts',
        BlogPostStorage.collection
      ),
      data as BlogPost,
      { id: validatedSlug, creator: true }
    )

    return true
  }

  return { createBlogPost }
}
