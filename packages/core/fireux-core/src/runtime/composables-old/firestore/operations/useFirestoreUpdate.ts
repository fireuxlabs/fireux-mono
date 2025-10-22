import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

export function useFirestoreUpdate() {
  const db = useFirestore()

  async function updateDocument<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, collection, id)
    await updateDoc(ref, { ...data, updated_at: serverTimestamp() })
  }

  return { updateDocument }
}
