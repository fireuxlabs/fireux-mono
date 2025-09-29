// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useFirestore, useCurrentUser } from 'vuefire'
import { doc, setDoc } from 'firebase/firestore'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

/**
 * Environment-aware updater for a user's docs.
 * - If `userRef` provided → writes to that user's doc.
 * - Else → writes to the signed-in user's doc.
 * Scopes:
 *   - Global → core-users/{uid}
 *   - Tenant → apps/{appId}/users/{uid}
 * NOTE: This composable only WRITES; uploading is done elsewhere.
 */
export function useUserUpdate(userRef?: Ref<User | null>) {
  const db = useFirestore()
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const resolveTargetUid = (): string => {
    const explicit = userRef?.value?.id
    if (explicit) return explicit
    const current = authRef.value?.uid
    if (!current) throw new Error('Not signed in and no userRef.id provided')
    return current
  }

  const getDocRef = () => {
    const uid = resolveTargetUid()
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return doc(db, `apps/${appId}/users`, uid)
    }
    return doc(db, 'core-users', uid)
  }

  /** Update display_name in the correct scope */
  const updateDisplayName = async (display_name: string) => {
    await setDoc(getDocRef(), { display_name }, { merge: true })
  }

  /**
   * Update avatar URL in the correct scope.
   * Pass a finalized DOWNLOAD URL here (upload happens elsewhere).
   */
  const updateAvatar = async (avatar: string) => {
    await setDoc(getDocRef(), { avatar }, { merge: true })
    return avatar
  }

  return { updateDisplayName, updateAvatar }
}
