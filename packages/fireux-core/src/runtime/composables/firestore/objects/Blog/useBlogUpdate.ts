import { useFirestoreUpdate } from '../../useFirestoreUpdate'
import { serverTimestamp } from 'firebase/firestore'
import type { BlogPost } from '../../../../models/objects/blogPost.model'

export function useBlogUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  async function updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<boolean> {
    try {
      if (!postId) {
        throw new Error('No BlogPost ID provided.')
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument('blogs', postId, updateData)
      console.log(`✅ BlogPost updated successfully: ${postId}`)
      return true
    } catch (error) {
      console.error('❌ Error updating BlogPost:', error)
      throw error
    }
  }

  return { updateBlogPost }
}
