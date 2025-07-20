import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'

/**
 * Generic profile update composable foundation
 * Provides standardized update infrastructure that profile-specific composables can extend
 */
export function useProfileUpdate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { updateDocument } = useFirestoreManager()

  // Set default appScoped to false for global profile ecosystem
  const config = {
    ...profileConfig,
    appScoped: profileConfig.appScoped ?? false,
  }

  // Shared state for update operations
  const updating = ref(false)
  const updateError = ref<Error | null>(null)

  // Generic update foundation with standardized best practices
  async function updateProfile(updateData: any, id?: string): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    updating.value = true
    updateError.value = null

    try {
      // Add updated timestamp and exclude immutable fields
      const profileData = {
        ...updateData,
        updated_at: serverTimestamp(),
      }

      // Remove immutable fields if they exist
      if ('uid' in profileData) delete profileData.uid
      if ('created_at' in profileData) delete profileData.created_at

      await updateDocument(config.collectionName, targetId, profileData, {
        appScoped: config.appScoped,
      })

      return 'success'
    } catch (err: any) {
      updateError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to update ${config.profileType} profile`
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
    // Shared utilities for profile-specific composables
    config,
    currentUser,
    updateDocument,
  }
}
