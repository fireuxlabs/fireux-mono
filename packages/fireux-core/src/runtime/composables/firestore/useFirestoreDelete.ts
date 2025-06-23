import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUtils } from './useFirestoreUtils'
import { useFireUXConfig } from '../FireUXConfig'

export function useFirestoreDelete() {
  const db = useFirestore()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { appId } = useFireUXConfig()

  async function deleteDocument(
    name: string,
    id: string,
    opts?: { appScoped?: boolean }
  ): Promise<void> {
    await waitForCurrentUser()
    const ref = doc(db, name, id)
    // Optionally: fetch doc and check appId if appScoped (for extra safety)
    // For now, just delete by ID
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
