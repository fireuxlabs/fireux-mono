import { useFirestoreManager } from '../../../../../../../fireux-core/src/runtime/composables/firestore/useFirestoreManager'
import { useCurrentUser } from 'vuefire'

export function useJobDelete() {
  const { deleteDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()

  async function deleteJob(slug: string): Promise<boolean> {
    try {
      if (!slug) {
        throw new Error('Job slug is required for deletion.')
      }

      if (!currentUser.value) {
        throw new Error('No authenticated user found.')
      }

      await deleteDocument('jobs', slug)
      console.log(`✅ Job deleted successfully: ${slug}`)
      return true
    } catch (error) {
      console.error('❌ Error deleting job:', error)
      throw error
    }
  }

  return { deleteJob }
}
