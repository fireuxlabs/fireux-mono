// ~/composables/firestore/objects/useObjectDelete.ts

import { useFirestoreManager } from '../useFirestoreManager'
import { useCurrentUser } from 'vuefire'

export function useObjectDelete() {
  const { deleteDocument } = useFirestoreManager()
  const currentUser = useCurrentUser()

  async function deleteObject(
    collectionName: string,
    id: string
  ): Promise<boolean> {
    try {
      if (!id) {
        throw new Error(`No ${collectionName} ID provided.`)
      }

      if (!currentUser.value) {
        throw new Error('No authenticated user found.')
      }

      await deleteDocument(collectionName, id)
      console.log(`✅ ${collectionName} object deleted successfully: ${id}`)
      return true
    } catch (error) {
      console.error(`❌ Error deleting ${collectionName} object:`, error)
      throw error
    }
  }

  return { deleteObject }
}
