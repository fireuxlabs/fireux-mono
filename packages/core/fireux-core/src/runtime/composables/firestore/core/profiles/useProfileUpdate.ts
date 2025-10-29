// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfileUpdate.ts
import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'

import type { ProfileConfig } from './useProfile'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import { useFireUXConfig } from '../../../FireUXConfig.ts'

/**
 * Generic profile updater (collection-agnostic).
 * Adds updated_at, strips immutable fields, and writes via FirestoreManager.
 */
export function useProfileUpdate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { updateDocument } = useFirestoreManager()
  const { appId } = useFireUXConfig()

  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  const sanitizePayload = (updateData: Record<string, unknown>) => {
    const payload: Record<string, unknown> = { ...updateData }
    if ('uid' in payload) delete payload.uid
    if ('created_at' in payload) delete payload.created_at
    if ('updated_at' in payload) delete payload.updated_at
    return payload
  }

  const write = async (
    scope: 'core' | 'app',
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
      const payload = sanitizePayload(updateData)
      const collectionPath =
        scope === 'core'
          ? profileConfig.collectionName
          : (() => {
              if (!appId) {
                throw new Error(
                  `Cannot update app overlay for ${profileConfig.profileType} profile without an appId`
                )
              }
              return `apps/${appId}/${profileConfig.collectionName}`
            })()

      await updateDocument(collectionPath, targetId, payload)
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

  const updateCore = (
    updateData: Record<string, unknown>,
    id?: string
  ): Promise<'success'> => write('core', updateData, id)

  const updateApp = (
    updateData: Record<string, unknown>,
    id?: string
  ): Promise<'success'> => write('app', updateData, id)

  const updateProfile = (
    updateData: Record<string, unknown>,
    id?: string
  ): Promise<'success'> => updateCore(updateData, id)

  return {
    updateCore,
    updateApp,
    updateProfile,
    updating,
    updateError,
  }
}
