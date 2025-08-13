import { ref } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useAppUser } from '../AppUser/useAppUser'
import useAppUserUpdate from '../AppUser/useAppUserUpdate'

/**
 * Generic profile creation composable
 * Provides standardized create functionality for all profile types
 */
export async function useProfileCreate(profileConfig: ProfileConfig) {
  const currentUser = useCurrentUser()
  const { setDocument } = useFirestoreManager()

  // Set default appScoped to false for global profile ecosystem
  const config = {
    ...profileConfig,
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
      // Get appUser data when needed
      const { appUser } = await useAppUser()
      // Check if profile already exists in Firestore
      const { firestoreFetchDoc } = useFirestoreManager()
      const existingProfileDoc = await firestoreFetchDoc(
        config.collectionName,
        currentUser.value.uid
      )

      if (existingProfileDoc) {
        // PATH 1: Profile exists - just update AppUser.profiles array and bail out
        console.log(
          '🔄 This profile actually exists on this user. Updating array......'
        )

        const { useAppUserUpdateFirestore } = useAppUserUpdate()
        const { updateProfiles } = useAppUserUpdateFirestore()

        const currentProfiles = appUser.value?.profiles || []
        const profileEntry = {
          type: config.profileType.toLowerCase(),
          collection: config.collectionName,
          created_at: new Date().toISOString(),
          is_active: true,
        }

        // Check if it's already in the array
        const existingInArray = currentProfiles.find(
          (p) => p.type === profileEntry.type
        )
        if (!existingInArray) {
          const updatedProfiles = [...currentProfiles, profileEntry]
          await updateProfiles(updatedProfiles)
          console.log(
            '✅ Added existing profile to AppUser.profiles array:',
            profileEntry.type
          )
        }

        return 'success'
      }

      // PATH 2: Profile doesn't exist - create it and update array
      console.log('🆕 Creating new profile and updating array......')

      // Base profile data with standardized fields
      const profileData = {
        uid: currentUser.value.uid,
        created_at: serverTimestamp(), // Use server timestamp for accuracy
        updated_at: serverTimestamp(),
        // Required Profile fields
        avatarUrl: currentUser.value.photoURL || '/default-avatar.png',
        // Include common user data from appUser
        email: appUser.value?.email || currentUser.value.email || '',
        ...additionalData, // Merge any additional form data
      }

      // Use the authenticated user's ID as the document ID
      await setDocument(
        config.collectionName,
        currentUser.value.uid,
        profileData,
        {
          appScoped: false,
        }
      )

      // Update AppUser profiles array
      const { useAppUserUpdateFirestore } = useAppUserUpdate()
      const { updateProfiles } = useAppUserUpdateFirestore()

      const currentProfiles = appUser.value?.profiles || []
      const newProfileEntry = {
        type: config.profileType.toLowerCase(),
        collection: config.collectionName,
        created_at: new Date().toISOString(),
        is_active: true,
      }

      // Check if profile doesn't already exist in array
      const existingProfile = currentProfiles.find(
        (p) => p.type === newProfileEntry.type
      )
      if (!existingProfile) {
        const updatedProfiles = [...currentProfiles, newProfileEntry]
        await updateProfiles(updatedProfiles)
        console.log(
          '✅ Updated AppUser.profiles with new profile:',
          newProfileEntry.type
        )
      }

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
