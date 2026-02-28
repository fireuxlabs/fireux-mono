import { serverTimestamp } from 'firebase/firestore'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate.ts'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
import type { BlogPost } from '../../../../../../models/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  async function updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<boolean> {
    if (!postId) {
      throw new Error('No blog post ID provided.')
    }

    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid update payload. Must be an object.')
    }

    const updateData = {
      ...updates,
      updated_at: serverTimestamp(),
    }

    await updateDocument('blogs', postId, updateData)
    await upsertSeoIndexDoc('seo_index_blogs', postId, {
      path: `/blog/${String(updates?.slug || postId).trim()}`,
      isPublic: true,
    })
    if (import.meta.dev) {
      console.log(`✅ Blog post updated successfully: ${postId}`)
    }
    return true
  }

  return { updateBlogPost }
}
