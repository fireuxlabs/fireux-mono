// ~/composables/firestore/CoreUser/useCoreUser.ts
import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import { useCoreUserEnsure } from './useCoreUserEnsure'
import { useCoreUserUpdate } from './useCoreUserUpdate'
import { useCoreUserDelete } from './useCoreUserDelete'
import { useCoreUserComputed } from './useCoreUserComputed'
import type { CoreUser } from '../../../models/core/coreUser.model'
import { getApps } from 'firebase/app'

export async function useCoreUser() {
  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreManager()

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

  // Collections - fetch all core users (remove client-only restriction for dev purposes)
  const coreUsers = await firestoreFetchCollection<CoreUser>('core-users')

  return {
    // Current entity
    coreUser,

    // Collections
    coreUsers,

    // Child functions
    ...useCoreUserEnsure(),
    ...useCoreUserUpdate(),
    ...useCoreUserDelete(),
    ...useCoreUserComputed(coreUser),
  }
}
