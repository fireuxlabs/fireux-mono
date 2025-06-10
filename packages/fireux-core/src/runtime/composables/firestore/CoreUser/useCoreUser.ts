// ~/composables/firestore/CoreUseruseCoreUser.js

import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useDocument, useCurrentUser, useFirestore } from 'vuefire'
import { useCoreUserEnsure } from './useCoreUserEnsure'
import { useCoreUserUpdate } from './useCoreUserUpdate'
import { useCoreUserDelete } from './useCoreUserDelete'
import type { CoreUser } from '../../../models/coreUser.model'

export async function useCoreUser() {
  const db = useFirestore()
  const currentUser = useCurrentUser()

  const coreUserDocRef = computed(() => {
    return currentUser.value
      ? doc(db, 'core-users', currentUser.value.uid)
      : null
  })

  const { data: coreUser } = useDocument<CoreUser>(coreUserDocRef) // Updated to use CoreUser model

  return {
    coreUser,
    ...(await useCoreUserEnsure()),
    ...(await useCoreUserUpdate()),
    ...(await useCoreUserDelete()),
  }
}
