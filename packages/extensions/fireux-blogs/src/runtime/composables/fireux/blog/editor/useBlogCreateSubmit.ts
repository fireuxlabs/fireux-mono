import { useBlogCreate } from '../../firestore/blog/mutations/useBlogCreate'
import { useBlogPublish } from '../../firestore/blog/mutations/useBlogPublish'
import { useBlogUtils } from '../../firestore/blog/utils/useBlogUtils'
import { useBlogDraftState } from './useBlogDraftState'

export function useBlogCreateSubmit() {
  const { getBlogPostPayload } = useBlogDraftState()
  const { createBlogPost } = useBlogCreate()
  const { publishBlog } = useBlogPublish()
  const { normalizeBlogSlug } = useBlogUtils()

  const submit = async (
    uploadImages?: (slug: string) => Promise<{
      featuredImage: string
      socialImage: string
    } | undefined>
  ) => {
    const payload = getBlogPostPayload()
    const slug = payload.slug || normalizeBlogSlug(payload.title || '')
    if (!slug) throw new Error('Slug is required to publish a blog post')

    const uploaded = await uploadImages?.(slug)
    if (uploaded?.featuredImage) payload.featuredImage = uploaded.featuredImage
    if (uploaded?.socialImage) payload.socialImage = uploaded.socialImage
    for (const [label, value] of [
      ['Featured image', payload.featuredImage],
      ['Social image', payload.socialImage],
    ] as const) {
      try {
        if (!value || new URL(value).protocol !== 'https:') {
          throw new Error()
        }
      } catch {
        throw new Error(`${label} must be uploaded to shared durable media before publishing.`)
      }
    }

    await createBlogPost(payload, slug)
    await publishBlog({
      slug,
      title: payload.title,
      publicationScope:
        payload.publication_scope === 'ecosystem' ? 'ecosystem' : 'app',
    })
    return slug
  }

  return { submit }
}
