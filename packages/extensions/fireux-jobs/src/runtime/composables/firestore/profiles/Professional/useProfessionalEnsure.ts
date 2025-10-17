import { useFirestore } from 'vuefire'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/auth/useRequireUser.ts'

/**
 * Ensure/create-if-missing for Professional (core or app overlay based on context).
 * Minimal: only creates the doc with id if missing.
 */
export async function useProfessionalEnsure() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const u = await useRequireUser()
  if (!u?.uid) throw new Error('Not authenticated')
  const uid = u.uid

  const collection = isTenant ? `apps/${appId}/professionals` : 'professionals'
  const ref = doc(db, collection, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { id: uid, created_at: serverTimestamp() })
  }
  return { collection, id: uid }
}
