import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'

/**
 * Shared composable for profile CRUD operations and state management
 * This is the unified entry point for all profile types (Professional, Employer, Chef, Supplier)
 */
export async function useProfile(profileConfig: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  // Use the provided config directly
  const config = profileConfig

  // Reactive document reference for current user's profile
  const currentProfileDocRef = computed(() =>
    currentUser.value?.uid
      ? doc(db, config.collectionName, currentUser.value.uid)
      : null
  )

  const { data: currentProfile } = useDocument(currentProfileDocRef)

  // Fetch all profiles in this collection - await the Promise
  const allProfiles = await firestoreFetchCollection(config.collectionName, {
    appScoped: false, // Profiles are globally scoped
  }) // Fetch a specific profile by ID
  async function fetchById(id: string) {
    return await firestoreFetchDoc(config.collectionName, id, {
      appScoped: false, // Profiles are globally scoped
    })
  }

  // Expose create functionality
  const profileCreate = useProfileCreate(config)

  // Expose delete functionality
  const profileDelete = useProfileDelete(config)

  // Expose update functionality (if provided in config)
  const profileUpdate = config.updateComposable ? config.updateComposable() : {}

  const returnObject = {
    [`current${config.profileType}`]: currentProfile,
    [`${config.collectionName}`]: allProfiles,
    [`fetch${config.profileType}`]: fetchById,
    all: allProfiles, // Add alias for easier destructuring
    ...profileCreate,
    ...profileDelete,
    ...profileUpdate,
  }

  // Debug logging
  console.log('useProfile return keys:', Object.keys(returnObject))
  console.log('Expected fetchChef:', `fetch${config.profileType}`)
  console.log('fetchById function:', typeof fetchById)

  return returnObject
}
