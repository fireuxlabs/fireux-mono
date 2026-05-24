import { useBlogCreate } from '../../firestore/blog/mutations/useBlogCreate'
import { useBlogPublish } from '../../firestore/blog/mutations/useBlogPublish'
import { useBlogUtils } from '../../firestore/blog/utils/useBlogUtils'
import { useBlogDraftState } from './useBlogDraftState'

export function useBlogCreateSubmit() {
  const { getBlogPostPayload } = useBlogDraftState()
  const { createBlogPost } = useBlogCreate()
  const { publishBlog } = useBlogPublish()
  const { normalizeBlogSlug } = useBlogUtils()

  const submit = async () => {
    const payload = getBlogPostPayload()
    const slug = payload.slug || normalizeBlogSlug(payload.title || '')
    if (!slug) throw new Error('Slug is required to publish a blog post')

    await createBlogPost(payload, slug)
    await publishBlog({
      slug,
      title: payload.title,
    })
    return slug
  }

  return { submit }
}
