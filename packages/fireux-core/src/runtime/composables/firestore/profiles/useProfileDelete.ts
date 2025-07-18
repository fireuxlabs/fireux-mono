import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useAppUser } from '../AppUser/useAppUser'
import { useAppUserUpdate } from '../AppUser/useAppUserUpdate'

/**
 * Generic profile deletion composable
 * Provides standardized delete functionality for all profile types
 */
export async function useProfileDelete(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { deleteDocument } = useFirestoreManager()
  const { appUser } = await useAppUser()

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
      await deleteDocument(config.collectionName, targetId, {
        appScoped: false,
      })

      // Update AppUser profiles array - remove the deleted profile
      const { useAppUserUpdateFirestore } = useAppUserUpdate()
      const { updateProfiles } = useAppUserUpdateFirestore()

      const currentProfiles = appUser.value?.profiles || []
      const updatedProfiles = currentProfiles.filter(
        (p) => p.type !== config.profileType.toLowerCase()
      )

      if (currentProfiles.length !== updatedProfiles.length) {
        await updateProfiles(updatedProfiles)
        console.log(
          '✅ Removed profile from AppUser.profiles:',
          config.profileType.toLowerCase()
        )
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
