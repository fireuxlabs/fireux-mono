import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'

/**
 * Create a draft job in the active tenant scope and return its id.
 */
export function useJobEnsure() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { uid } = useAuth()

  const createDraftJob = async () => {
    if (!appId) throw new Error('[useJobEnsure] Missing appId')
    if (!uid.value) throw new Error('[useJobEnsure] Not authenticated')

    const jobsCol = collection(db, 'apps', appId, 'jobs')
    const docRef = await addDoc(jobsCol, {
      title: 'Untitled Job',
      description: null,
      pay: null,
      status: 'draft',
      created_by: uid.value,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })

    return docRef.id
  }

  return { createDraftJob }
}
