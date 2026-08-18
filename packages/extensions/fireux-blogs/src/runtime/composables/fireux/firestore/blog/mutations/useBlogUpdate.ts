import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  BlogPostStorage,
  type BlogPost,
} from '../../../../../models/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateBlogPost(input: {
    blogPostId: string
    changes: Partial<BlogPost>
  }): Promise<boolean> {
    const blogPostId = String(input.blogPostId || '').trim()
    const updates = input.changes
    if (!blogPostId) {
      throw new Error('No blog post ID provided.')
    }

    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid update payload. Must be an object.')
    }

    const requestedSlug =
      updates.slug === undefined
        ? blogPostId
        : String(updates.slug || '').trim()
    const slugValidation = validatePublicSlug(requestedSlug, {
      label: 'Blog post slug',
      namespace: 'blog',
      reservedScope: 'entity',
    })

    if (!slugValidation.isValid) {
      throw new Error(slugValidation.message || 'Blog post slug is invalid')
    }

    if (slugValidation.slug !== blogPostId) {
      throw new Error('Blog post slug must match blog post id.')
    }

    const nextUpdates = (
      updates.slug === undefined ? updates : { ...updates, slug: blogPostId }
    ) as Partial<BlogPost>

    await updateDocument(BlogPostStorage.collection, blogPostId, nextUpdates)
    if (import.meta.dev) {
      console.log(`✅ Blog post updated successfully: ${blogPostId}`)
    }
    return true
  }

  return { updateBlogPost }
}
