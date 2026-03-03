import { doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import { useFirestore } from 'vuefire'
import type { BlogPost, BlogPostEntry } from '../../../../../models/blogPost.model'

export const BlogPayload = {
  id: '',
  slug: '',
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
  appId: '',
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
    const data = {
      ...payload,
      id: slug,
      slug,
      appId: payload.appId || fireux.appId,
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
