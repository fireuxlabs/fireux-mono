import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useUser } from '../user/useUser'
import { useFirestoreUpdate } from '../useFirestoreUpdate'

/**
 * Generic profile deletion composable
 * Provides standardized delete functionality for all profile types
 */
export function useProfileDelete(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { deleteDocument } = useFirestoreManager()

  // Set default appScoped to false for global profile ecosystem
  const config = {
    ...profileConfig,
  }

  // Shared state for delete operations
  const deleting = ref(false)
  const deleteError = ref<Error | null>(null)

  // Generic delete function with standardized best practices
  async function deleteProfile(id?: string): Promise<string> {
    const targetId = id || currentUser.value?.uid

    if (!targetId) {
      throw new Error('No profile ID provided and user is not authenticated')
    }

    deleting.value = true
    deleteError.value = null

    try {
      // Get appUser data when needed
      const { user } = useUser()
      await deleteDocument(config.collectionName, targetId, {
        appScoped: false,
      })

      // Update AppUser profiles array - remove the entry by type
      const currentProfiles = (user.value?.app?.app_profiles ?? []) as any[]
      const typeKey = config.id
      const updatedProfiles = currentProfiles.filter((p) => p?.type !== typeKey)

      if (currentProfiles.length !== updatedProfiles.length) {
        if (user.value?.app && user.value?.id) {
          const { updateDocument } = useFirestoreUpdate()
          await updateDocument(
            'apps/' + (user.value.app as any).appId + '/users',
            user.value.id,
            { app_profiles: updatedProfiles } as any
          )
        }
        console.log('✅ Removed profile from AppUser.app_profiles:', typeKey)
      }

      return 'success'
    } catch (err: any) {
      deleteError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to delete ${config.profileType} profile`
            )
      throw deleteError.value
    } finally {
      deleting.value = false
    }
  }

  return {
    deleteProfile,
    deleting,
    deleteError,
  }
}
