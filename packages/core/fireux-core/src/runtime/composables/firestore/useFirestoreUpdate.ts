// ~/composables/firestore/operations/useFirestoreUpdate.ts
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreUpdate() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function updateDocument<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await waitForCurrentUser()
    const ref = doc(db, collection, id)
    await updateDoc(ref, { ...data, updated_at: serverTimestamp() })
  }

  return { updateDocument }
}
