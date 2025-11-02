// packages/core/fireux-core/src/runtime/composables/firestore/profiles/chef/useChefUpdate.ts
import type { Ref } from 'vue'
import { useCurrentUser } from 'vuefire'
// Composables are auto-imported from core; avoid restricted subpath imports

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

type TargetScope = 'auto' | 'core' | 'app'

export function useChefUpdate(chefRef?: Ref<WithId | null>) {
  const authRef = useCurrentUser()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage } = useImageStorage()

  const resolveTarget = (scope: TargetScope = 'auto') => {
    const id = chefRef?.value?.id ?? authRef.value?.uid
    if (!id) throw new Error('Not signed in and no chefRef.id provided')
    if (scope === 'app' || (scope === 'auto' && isTenant)) {
      if (!appId) throw new Error('Missing appId for tenant-scoped chef update')
      return { collection: `apps/${appId}/chefs`, id }
    }
    return { collection: 'chefs', id }
  }

  /** Generic partial update for arbitrary chef fields */
  const updateFields = async (
    partial: Record<string, unknown>,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = resolveTarget(scope)
    await updateDocument(collection, id, partial)
  }

  /** Update display name */
  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => {
    await updateFields({ display_name }, scope)
  }

  /** Avatar: build `${collection}/${id}/avatar` and upload via useImageStorage */
  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const { collection, id } = resolveTarget(scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateFields({ avatar: url }, scope)
    return url
  }

  return { updateFields, updateDisplayName, updateAvatar }
}
