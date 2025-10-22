// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfileUpdate.ts
import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'

import type { ProfileConfig } from './useProfile'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'

/**
 * Generic profile updater (collection-agnostic).
 * Adds updated_at, strips immutable fields, and writes via FirestoreManager.
 */
export function useProfileUpdate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { updateDocument } = useFirestoreManager()

  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const updateProfile = async (
    updateData: Record<string, unknown>,
    id?: string
  ): Promise<'success'> => {
    const targetId = id || currentUser.value?.uid
    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      const payload: Record<string, unknown> = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      if ('uid' in payload) delete payload.uid
      if ('created_at' in payload) delete payload.created_at

      await updateDocument(profileConfig.collectionName, targetId, payload)
      return 'success'
    } catch (error: unknown) {
      updateError.value =
        error instanceof Error
          ? error
          : new Error(
              (error as { message?: string })?.message ||
                `Failed to update ${profileConfig.profileType} profile`
            )
      throw updateError.value
    } finally {
      updating.value = false
    }
  }

  return {
    updateProfile,
    updating,
    updateError,
  }
}
