import { useBlogCommand } from '../authoring/useBlogCommand'
import { useBlogCreate } from '../firestore/mutations/useBlogCreate'
import { useBlogPublish } from '../firestore/mutations/useBlogPublish'
import { useBlogUtils } from '../firestore/utils/useBlogUtils'
import { useBlogDraftState } from './useBlogDraftState'
import { assertBlogEditorialApproval } from '../../utils/editorial-review'

export function useBlogCreateSubmit() {
  const { captureIntent, scopeEpoch } = useBlogCommand()
  const { getBlogPostPayload } = useBlogDraftState()
  const { createBlogPost } = useBlogCreate()
  const { publishBlog } = useBlogPublish()
  const { normalizeBlogSlug } = useBlogUtils()

  const submit = async (
    uploadImages?: (slug: string) => Promise<
      | {
          featuredImage: string
          socialImage: string
        }
      | undefined
    >
  ) => {
    const isCurrent = captureIntent()
    const assertCurrent = () => { if (!isCurrent()) throw new Error('The Blog authoring context changed. Reopen the draft.') }
    const payload = JSON.parse(JSON.stringify(getBlogPostPayload()))
    assertBlogEditorialApproval(payload)
    const slug = payload.slug || normalizeBlogSlug(payload.title || '')
    if (!slug) throw new Error('Slug is required to publish a blog post')

    const uploaded = await uploadImages?.(slug)
    assertCurrent()
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
        throw new Error(
          `${label} must be uploaded to shared durable media before publishing.`
        )
      }
    }

    await createBlogPost(payload, slug)
    assertCurrent()
    await publishBlog({
      slug,
      title: payload.title,
      publicationScope:
        payload.publication_scope === 'ecosystem' ? 'ecosystem' : 'app',
    })
    return slug
  }

  return { submit, captureIntent, scopeEpoch }
}
