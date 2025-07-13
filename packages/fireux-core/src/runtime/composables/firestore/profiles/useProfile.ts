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
export function useProfile(profileConfig: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  // Set default appScoped to false for global profile ecosystem
  const config = {
    ...profileConfig,
    appScoped: profileConfig.appScoped ?? false,
  }

  // Reactive document reference for current user's profile
  const currentProfileDocRef = computed(() =>
    currentUser.value?.uid
      ? doc(db, config.collectionName, currentUser.value.uid)
      : null
  )

  const { data: currentProfile } = useDocument(currentProfileDocRef)

  // Fetch all profiles in this collection
  const allProfiles = firestoreFetchCollection(config.collectionName, {
    appScoped: config.appScoped,
  })

  // Fetch a specific profile by ID
  async function fetchById(id: string) {
    return await firestoreFetchDoc(config.collectionName, id, {
      appScoped: config.appScoped,
    })
  }

  // Expose create functionality
  const profileCreate = useProfileCreate(config)

  // Expose delete functionality
  const profileDelete = useProfileDelete(config)

  // Expose update functionality (if provided in config)
  const profileUpdate = config.updateComposable ? config.updateComposable() : {}

  return {
    [`current${config.profileType}`]: currentProfile,
    [`${config.collectionName}`]: allProfiles,
    [`fetch${config.profileType}`]: fetchById,
    ...profileCreate,
    ...profileDelete,
    ...profileUpdate,
  }
}
