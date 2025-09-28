// ~/composables/firestore/operations/useFirestoreUpdate.ts
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreUpdate() {
  const db = useFirestore()
  const { appName, appId } = useFireUXConfig()
  const { waitForCurrentUser } = useFirestoreUtils()
  const isDev = typeof process !== 'undefined' && (process as any).dev === true
  const dlog = (...args: any[]) => {
    if (isDev) console.log('[avatar-trace][FirestoreUpdate]', ...args)
  }

  async function updateDocument<T extends { updated_at?: unknown }>(
    name: string,
    id: string,
    data: Partial<T>,
    opts?: { appScoped?: boolean }
  ): Promise<void> {
    if (!name || !id || !data) {
      throw new Error('Collection name, document ID, and data are required.')
    }

    try {
      await waitForCurrentUser()
      const ref = doc(db, name, id)

      // Prepare update data with required fields
      const updateData: any = { ...data }
      updateData.updated_at = serverTimestamp()

      // Only tag app metadata when appScoped !== false; do not overwrite if provided explicitly
      if (opts?.appScoped !== false) {
        updateData.app_name ??= appName
        updateData.app_id ??= appId
        // appId legacy alias (kept for back-compat where readers expect camelCase)
        ;(updateData as Record<string, unknown>).appId ??= appId
      }

      dlog('updateDocument', {
        name,
        id,
        keys: Object.keys(updateData),
        appScoped: opts?.appScoped !== false,
        appId,
      })
      await updateDoc(ref, updateData)
      console.log(`✅ Document updated in '${name}' with ID: ${id}`)
    } catch (error) {
      console.error(`❌ Error updating document in '${name}':`, error)
      throw error
    }
  }

  return { updateDocument }
}
