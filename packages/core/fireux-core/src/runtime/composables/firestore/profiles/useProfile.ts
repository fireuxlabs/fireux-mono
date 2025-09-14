// packages/core/fireux-core/src/runtime/composables/firestore/profiles/useProfile.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { ProfileConfig } from '../../../models/profiles/profile.model'
import { useFirestoreRead } from '../useFirestoreRead'
import { useProfileCreate } from './useProfileCreate'
import { useProfileDelete } from './useProfileDelete'
import { useFireUXConfig } from '../../FireUXConfig'

/**
 * Unified entry-point for a profile type (e.g., Chef, Supplier).
 * v1.1: ecosystem+app surface.
 */
export async function useProfile(config: ProfileConfig) {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { appId } = useFireUXConfig()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreRead()

  const uid = computed(() => currentUser.value?.uid || null)

  // Ecosystem (global) profile doc of the signed-in user
  const ecosystemProfileDocRef = computed(() =>
    uid.value ? doc(db, config.collectionName, uid.value) : null
  )
  const { data: ecosystemProfile } = useDocument(ecosystemProfileDocRef)

  // App-scoped profile doc of the signed-in user
  const appProfileDocRef = computed(() =>
    uid.value && appId
      ? doc(db, 'apps', appId, config.collectionName, uid.value)
      : null
  )
  const { data: appProfile } = useDocument(appProfileDocRef)

  // Ecosystem collection (browse/discover)
  const ecosystemCollection = await firestoreFetchCollection(
    config.collectionName
  )

  // Fetch any ecosystem profile by id
  const fetchById = async (id: string) =>
    await firestoreFetchDoc(config.collectionName, id)

  // CRUD (ecosystem for now; app-scoped create is separate if/when needed)
  const create = await useProfileCreate(config)
  const remove = await useProfileDelete(config)
  const update = config.updateComposable ? config.updateComposable() : {}

  return {
    ecosystemProfile,
    appProfile,
    ecosystemCollection,
    fetchById,
    ...create,
    ...remove,
    ...update,
  }
}
