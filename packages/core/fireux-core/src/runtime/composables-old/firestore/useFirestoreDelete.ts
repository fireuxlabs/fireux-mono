import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useRequireUser } from '../firebase/useRequireUser'

export function useFirestoreDelete() {
  const db = useFirestore()
  useFireUXConfig()

  async function deleteDocument(
    name: string,
    id: string,
    _opts?: { appScoped?: boolean }
  ): Promise<void> {
    await useRequireUser()
    const ref = doc(db, name, id)
    // Optionally: fetch doc and check appId if appScoped (for extra safety)
    // For now, just delete by ID
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
