import { useBlogDraftState } from './useBlogDraftState'
import { useBlog } from '../../../objects/Blog/useBlog'

export function useBlogCreateSubmit() {
  const { getBlogPostPayload } = useBlogDraftState()
  const { createBlogPost, utils } = useBlog()

  const submit = async () => {
    const payload = getBlogPostPayload()
    const slug = payload.slug || utils.generateSlug(payload.title || '')
    if (!slug) throw new Error('Slug is required to publish a blog post')

    await createBlogPost(payload, slug)
    return slug
  }

  return { submit }
}
