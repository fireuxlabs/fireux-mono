import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'

/**
 * Shared composable for profile CRUD operations and state management
 * This is the unified entry point for all profile types (Professional, Employer, Chef, Supplier)
 */
export async function useProfile(
  config: ProfileConfig & { appCollectionName?: string }
) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  // Reactive document reference for current user's profile
  const currentProfileDocRef = computed(() =>
    currentUser.value?.uid
      ? doc(db, config.collectionName, currentUser.value.uid)
      : null
  )

  const { data: current } = useDocument(currentProfileDocRef)

  // Fetch all profiles in the global collection
  const globalCollection = await firestoreFetchCollection(config.collectionName)
  // Fetch all profiles in the app-specific collection, if provided
  let appCollection
  if (config.appCollectionName) {
    appCollection = await firestoreFetchCollection(config.appCollectionName)
  }

  // Fetch by ID function
  const fetchById = async (id: string) =>
    await firestoreFetchDoc(config.collectionName, id)

  // CRUD operations
  const create = await useProfileCreate(config)
  const remove = await useProfileDelete(config)
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    current,
    globalCollection,
    appCollection,
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
