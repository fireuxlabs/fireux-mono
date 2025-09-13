import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'

/**
 * Unified entry-point for a profile type (e.g., Chef, Supplier).
 * - current: reactive doc of the signed-in user’s profile in the *global* collection
 * - globalCollection: list of all profiles in that collection
 * - fetchById: helper to load any profile by id
 * - create/remove: generic creators
 *
 * Note: App-scoped presence is represented via AppUser.profiles array.
 */
export async function useProfile(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  // Reactive reference to the signed-in user's global profile doc
  const currentProfileDocRef = computed(() =>
    currentUser.value?.uid ? doc(db, config.collectionName, currentUser.value.uid) : null
  )

  const { data: current } = useDocument(currentProfileDocRef)

  // Global list for browsing/discovery
  const globalCollection = await firestoreFetchCollection(config.collectionName)

  // Fetch any profile by id from the global collection
  const fetchById = async (id: string) => await firestoreFetchDoc(config.collectionName, id)

  // CRUD hooks
  const create = await useProfileCreate(config)
  const remove = await useProfileDelete(config)
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    current,
    globalCollection,
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
