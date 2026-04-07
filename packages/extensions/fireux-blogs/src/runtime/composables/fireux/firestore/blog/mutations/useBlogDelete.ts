import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'

export function useBlogDelete() {
  const { deleteDocument } = useFirestoreManager()
  const { deleteSeoIndexDoc } = useSeoIndexWrite()

  async function deleteBlogPost(slug: string): Promise<boolean> {
    if (!slug) {
      throw new Error('No blog post slug provided.')
    }

    try {
      await deleteDocument('blogs', slug)
      await deleteSeoIndexDoc('seo_index_blogs', slug)
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
