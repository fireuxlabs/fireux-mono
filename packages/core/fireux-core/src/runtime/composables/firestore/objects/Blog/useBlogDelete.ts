import { useFirestoreManager } from '../../useFirestoreManager'

export function useBlogDelete() {
  const { deleteDocument } = useFirestoreManager()

  async function deleteBlogPost(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    try {
      await deleteDocument('blogs', slug)
      console.log('✅ Blog Post Deleted Successfully')
      return true
    } catch (error) {
      console.error('❌ Error Deleting Blog Post:', error)
      throw error
    }
  }

  return { deleteBlogPost }
}
