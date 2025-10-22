// ~/composables/firestore/objects/useObjectUpdate.ts

import { useFirestoreManager } from '../useFirestoreManager'
import { serverTimestamp } from 'firebase/firestore'
import type {
  FirestoreObject,
  ObjectUpdate,
} from '../../../models/objects/object.model'

export function useObjectUpdate() {
  const { updateDocument } = useFirestoreManager()

  async function updateObject<T extends FirestoreObject>(
    collectionName: string,
    id: string,
    updates: ObjectUpdate<T>
  ): Promise<boolean> {
    try {
      if (!id) {
        throw new Error(`No ${collectionName} ID provided.`)
      }

      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update payload. Must be an object.')
      }

      // Add server timestamp for updated_at
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      }

      await updateDocument(collectionName, id, updateData)
      console.log(`✅ ${collectionName} object updated successfully: ${id}`)
      return true
    } catch (error) {
      console.error(`❌ Error updating ${collectionName} object:`, error)
      throw error
    }
  }

  return { updateObject }
}
