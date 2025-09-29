// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'
import { useFirestoreUpdate } from '../useFirestoreUpdate'
import { useImageStorage } from '../../firebase/useImageStorage'

/**
 * Environment-aware updater for a user's docs.
 * - If `userRef` provided → writes to that user's doc.
 * - Else → writes to the signed-in user's doc.
 * Scopes:
 *   - Global → core-users/{uid}
 *   - Tenant → apps/{appId}/users/{uid}
 * NOTE: This composable only WRITES finalized data; uploading is done elsewhere.
 */
export function useUserUpdate(userRef?: Ref<User | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = () => {
    const id = userRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no userRef.id provided')
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/users`, id }
    }
    return { collection: 'core-users', id }
  }

  /** Generic partial update for arbitrary user fields */
  const updateFields = async (partial: Partial<User>) => {
    const { collection, id } = resolveTarget()
    await updateDocument<User>(collection, id, partial)
  }

  /** Update display_name in the correct scope */
  const updateDisplayName = async (display_name: string) => {
    await updateFields({ display_name } as Partial<User>)
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (source: Blob | string) => {
    const { collection, id } = resolveTarget()
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url })
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
