import { useBlog } from '../useBlog'
import { useBlogDraftState } from './useBlogDraftState'

export function useBlogCreateSubmit() {
  const { getBlogPostPayload } = useBlogDraftState()
  const { createBlogPost, utils } = useBlog()

  const submit = async () => {
    const payload = getBlogPostPayload()
    const slug = payload.slug || utils.normalizeBlogSlug(payload.title || '')
    if (!slug) throw new Error('Slug is required to publish a blog post')

    await createBlogPost(payload, slug)
    return slug
  }

  return { submit }
}
