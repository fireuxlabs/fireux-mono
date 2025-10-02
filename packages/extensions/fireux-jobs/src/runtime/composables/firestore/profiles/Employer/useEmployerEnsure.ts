import { useFirestore } from 'vuefire'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Ensure/create-if-missing for Employer (core or app overlay based on context).
 * Minimal: only creates the doc with id if missing.
 */
export async function useEmployerEnsure() {
  const db = useFirestore()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { waitForCurrentUser } = useFirestoreUtils()

  const u = await waitForCurrentUser()
  if (!u?.uid) throw new Error('Not authenticated')
  const uid = u.uid

  const collection = isTenant ? `apps/${appId}/employers` : 'employers'
  const ref = doc(db, collection, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { id: uid, created_at: serverTimestamp() })
  }
  return { collection, id: uid }
}
