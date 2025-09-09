// ~/composables/firestore/CoreUser/useCoreUser.ts
import { ref, computed, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import { useCoreUserEnsure } from './useCoreUserEnsure'
import { useCoreUserUpdate } from './useCoreUserUpdate'
import { useCoreUserDelete } from './useCoreUserDelete'
import { useCoreUserComputed } from './useCoreUserComputed'
import type { CoreUser } from '../../../models/core/coreUser.model'

export async function useCoreUser() {
  const db = useFirestore()
  // Guard useCurrentUser for SSR/hydration; only access on client
  const currentUser: Ref<null | { uid: string }> = import.meta.client
    ? useCurrentUser()
    : ref(null)
  const { firestoreFetchCollection } = useFirestoreManager()

  const coreUserDocRef = computed<DocumentReference<CoreUser> | null>(() => {
    if (!import.meta.client) return null
    if (!currentUser.value) return null
    return doc(db, 'core-users', currentUser.value.uid) as DocumentReference<CoreUser>
  })

  const { data: coreUser } = useDocument<CoreUser>(coreUserDocRef)

  // Collections - fetch all core users (client-only)
  const coreUsers = import.meta.client
    ? await firestoreFetchCollection<CoreUser>('core-users')
    : []

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
