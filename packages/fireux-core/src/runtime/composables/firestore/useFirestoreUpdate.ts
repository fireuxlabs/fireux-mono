// ~/composables/firestore/operations/useFirestoreUpdate.ts
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreUpdate() {
  const db = useFirestore()
  const { appName, appId } = useFireUXConfig()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function updateDocument<T extends { updated_at?: unknown }>(
    name: string,
    id: string,
    data: Partial<T>,
    opts?: { appScoped?: boolean }
  ): Promise<void> {
    if (!name || !id || !data) {
      return Promise.reject(
        '❌ Collection name, document ID, and data are required.'
      )
    }

    try {
      await waitForCurrentUser()
      const ref = doc(db, name, id)
      // Optionally check appId if appScoped (for extra safety)
      if (opts?.appScoped !== false) {
        data.appId = appId
      }
      data.updated_at = serverTimestamp() // Ensure `updated_at` is optional
      await updateDoc(ref, { ...data, app_name: appName, app_id: appId })
      console.log(`✅ Document updated in '${name}' with ID: ${id}`)
    } catch (error) {
      console.error(`❌ Error updating document in '${name}':`, error)
      throw error
    }
  }

  return { updateDocument }
}
