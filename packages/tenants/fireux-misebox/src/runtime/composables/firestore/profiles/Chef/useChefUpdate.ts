// packages/core/fireux-core/src/runtime/composables/firestore/profiles/chef/useChefUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage'

/**
 * Environment-aware updater for a Chef profile.
 *
 * Behavior mirrors `useUserUpdate`:
 * - If `chefRef` provided → writes to that chef's doc (by `id`).
 * - Else → writes to the signed-in user's chef doc.
 *
 * Scopes:
 *   - Global  → chefs/{uid}
 *   - Tenant  → apps/{appId}/chefs/{uid}
 *
 * NOTE:
 * - This composable only WRITES finalized data (e.g. an avatar DOWNLOAD URL).
 * - Uploading is done elsewhere (e.g. your AvatarPicker / storage utilities).
 */
type WithId = { id: string }

export function useChefUpdate(chefRef?: Ref<WithId | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = () => {
    const id = chefRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no chefRef.id provided')
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/chefs`, id }
    }
    return { collection: 'chefs', id }
  }

  /** Generic partial update for arbitrary chef fields */
  const updateFields = async (partial: Record<string, unknown>) => {
    const { collection, id } = resolveTarget()
    await updateDocument(collection, id, partial)
  }

  /** Update display name */
  const updateDisplayName = async (display_name: string) => {
    await updateFields({ display_name })
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
