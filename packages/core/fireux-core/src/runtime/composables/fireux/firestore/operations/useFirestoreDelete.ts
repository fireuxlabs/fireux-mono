import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

export function useFirestoreDelete() {
  const db = useFirestore()

  async function deleteDocument(
    collectionPath: string,
    id: string
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, collectionPath, id)
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
