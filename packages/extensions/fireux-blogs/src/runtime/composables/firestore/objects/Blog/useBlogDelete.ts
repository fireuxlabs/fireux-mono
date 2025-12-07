import { useFirestoreManager } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreManager.ts'

export function useBlogDelete() {
  const { deleteDocument } = useFirestoreManager()

  async function deleteBlogPost(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    try {
      await deleteDocument('blogs', slug)
      if (import.meta.dev) {
        console.log('✅ Blog post deleted successfully')
      }
      return true
    } catch (error) {
      console.error('❌ Error deleting blog post:', error)
      throw error
    }
  }

  return { deleteBlogPost }
}
