import { useFirestore } from 'vuefire'
import { deleteDoc, doc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils.ts'

/**
 * Delete Professional document in current context (core vs tenant overlay).
 * Soft-delete can be implemented by switching to an update call.
 */
export async function useProfessionalDelete() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { waitForCurrentUser } = useFirestoreUtils()

  const u = await waitForCurrentUser()
  if (!u?.uid) throw new Error('Not authenticated')
  const uid = u.uid

  const collection = isTenant ? `apps/${appId}/professionals` : 'professionals'
  const ref = doc(db, collection, uid)
  await deleteDoc(ref)
  return { collection, id: uid }
}
