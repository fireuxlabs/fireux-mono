import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

export function useFirestoreUpdate() {
  const db = useFirestore()

  async function updateDocument<T>(
    collectionPath: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    const user = await useRequireUser()
    const ref = doc(db, collectionPath, id)
    await updateDoc(ref, {
      ...data,
      updated: {
        at: serverTimestamp(),
        by: user.uid,
      } as any,
      // Legacy flat field kept temporarily while readers/data migrate.
      updated_at: serverTimestamp(),
    })
  }

  return { updateDocument }
}
