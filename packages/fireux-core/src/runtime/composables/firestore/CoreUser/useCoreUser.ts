// ~/composables/firestore/CoreUser/useCoreUser.ts
import { computed, ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import { useCoreUserEnsure } from './useCoreUserEnsure'
import { useCoreUserUpdate } from './useCoreUserUpdate'
import { useCoreUserDelete } from './useCoreUserDelete'
import type { CoreUser } from '../../../models/coreUser.model'
import { getApps } from 'firebase/app'

export function useCoreUser() {
  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

  const coreUserDocRef = computed<DocumentReference<CoreUser> | null>(() =>
    currentUser.value
      ? (doc(
          db,
          'core-users',
          currentUser.value.uid
        ) as DocumentReference<CoreUser>)
      : null
  )

  const { data: coreUser } = useDocument<CoreUser>(coreUserDocRef)

  // Collections - only fetch on client side
  const coreUsers = import.meta.client
    ? firestoreFetchCollection<CoreUser>('core-users')
    : ref([])

  // Computed properties
  const isCoreUser = computed(() => !!coreUser.value)
  const hasAvatar = computed(() => !!coreUser.value?.avatar)
  const userOfApps = computed(() => coreUser.value?.userOf?.length || 0)
  const hasMultipleApps = computed(() => userOfApps.value > 1)

  // Methods
  async function fetchCoreUser(userId: string) {
    return await firestoreFetchDoc('core-users', userId)
  }

  // Get utility functions - direct imports for consistency
  const ensureCoreUser = useCoreUserEnsure()

  return {
    // Current entity
    coreUser,

    // Collections
    coreUsers,

    // Computed properties
    isCoreUser,
    hasAvatar,
    userOfApps,
    hasMultipleApps,

    // Methods
    fetchCoreUser,

    // Utilities
    ensureCoreUser,
    ...useCoreUserUpdate(),
    ...useCoreUserDelete(),
  }
}
