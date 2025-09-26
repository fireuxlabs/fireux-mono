// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'

/**
 * Minimal updater for the signed-in user's core/app docs.
 * - Updates core: core-users/{uid}
 * - If tenant context is active, mirrors to app: apps/{appId}/users/{uid}
 * - Auto-stamps updated_at and app metadata
 */
export function useUserUpdate() {
  const db = useFirestore()
  const { appName, appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { waitForCurrentUser } = useFirestoreUtils()
  const currentUser = useCurrentUser()

  async function getUid(): Promise<string> {
    // Prefer the util which waits until client user is available
    const u = await waitForCurrentUser().catch(() => currentUser.value)
    const uid = u?.uid
    if (!uid) throw new Error('User not authenticated')
    return uid
  }

  async function updateCore(data: Record<string, unknown>) {
    const uid = await getUid()
    const ref = doc(db, 'core-users', uid)
    await updateDoc(ref, {
      ...data,
      updated_at: serverTimestamp(),
      app_name: appName,
      app_id: appId,
    })
  }

  async function updateApp(data: Record<string, unknown>) {
    if (!isTenant || !appId) return
    const uid = await getUid()
    const ref = doc(db, `apps/${appId}/users`, uid)
    await updateDoc(ref, {
      ...data,
      updated_at: serverTimestamp(),
      app_name: appName,
      app_id: appId,
      appId, // explicit app scoping field used elsewhere
    })
  }

  const updateDisplayName = async (display_name: string) => {
    const payload = { display_name }
    await Promise.all([updateCore(payload), updateApp(payload)])
  }

  const updateAvatar = async (avatar: string) => {
    const payload = { avatar }
    await Promise.all([updateCore(payload), updateApp(payload)])
  }

  return { updateDisplayName, updateAvatar }
}
