import { computed, ref } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import type { AppUser } from '../../../models/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import { useAppUserUpdate } from './useAppUserUpdate'
import { useAppUserSubscription } from './useAppUserSubscription'
import { useAppUserComputed } from './useAppUserComputed'
import { useFireUXConfig } from '../../FireUXConfig'
import { getApps } from 'firebase/app'

export function useAppUser() {
  const { appId } = useFireUXConfig()

  // Ensure Firebase is initialized
  if (!getApps().length) {
    throw new Error(
      'Firebase is not initialized. Please initialize Firebase before using this composable.'
    )
  }

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreManager()

  const appUserDocRef = computed<DocumentReference<AppUser> | null>(() =>
    currentUser.value && appId
      ? (doc(
          db,
          `apps/${appId}/users`,
          currentUser.value.uid
        ) as DocumentReference<AppUser>)
      : null
  )

  const { data: appUser } = useDocument<AppUser>(appUserDocRef)

  // Collections - only fetch on client side
  const appUsers = import.meta.client
    ? firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
    : ref([])

  return {
    // Current entity
    appUser,

    // Collections
    appUsers,

    // Child functions
    ...useAppUserEnsure(),
    ...useAppUserUtils(),
    ...useAppUserUpdate(),
    ...useAppUserSubscription(appUser),
    ...useAppUserComputed(appUser),
  }
}
