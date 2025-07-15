import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useAppUser } from '../AppUser/useAppUser'

/**
 * Generic profile creation composable
 * Provides standardized create functionality for all profile types
 */
export async function useProfileCreate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { setDocument } = useFirestoreManager()
  const { appUser } = await useAppUser()

  // Set default appScoped to false for global profile ecosystem
  const config = {
    ...profileConfig,
    appScoped: profileConfig.appScoped ?? false,
  }

  // Shared state for create operations
  const creating = ref(false)
  const createError = ref<Error | null>(null)

  // Generic create function with standardized best practices
  async function createProfile(additionalData?: any): Promise<string> {
    if (!currentUser.value?.uid) {
      throw new Error('User is not authenticated')
    }

    creating.value = true
    createError.value = null

    try {
      // Base profile data with standardized fields
      const profileData = {
        uid: currentUser.value.uid,
        created_at: serverTimestamp(), // Use server timestamp for accuracy
        updated_at: serverTimestamp(),
        // Include common user data from appUser
        email: appUser.value?.email || '',
        ...additionalData, // Merge any additional form data
      }

      // Use the authenticated user's ID as the document ID
      await setDocument(
        config.collectionName,
        currentUser.value.uid,
        profileData,
        {
          appScoped: config.appScoped,
        }
      )

      return 'success'
    } catch (err: any) {
      createError.value =
        err instanceof Error
          ? err
          : new Error(
              err?.message || `Failed to create ${config.profileType} profile`
            )
      throw createError.value
    } finally {
      creating.value = false
    }
  }

  return {
    createProfile,
    creating,
    createError,
  }
}
