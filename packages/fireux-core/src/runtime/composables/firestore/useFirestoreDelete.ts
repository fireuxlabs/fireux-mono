import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreDelete() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function deleteDocument(name: string, id: string): Promise<void> {
    await waitForCurrentUser()
    const ref = doc(db, name, id)
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
