import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreRead } from '../useFirestoreRead'
import type { AppUser } from '../../../models/core/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import useAppUserUpdate from './useAppUserUpdate'
import { useAppUserSubscription } from './useAppUserSubscription'
import { useAppUserComputed } from './useAppUserComputed'

export async function useAppUser() {
  // Top-level context
  const appId = 'misebox-app'

  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection } = useFirestoreRead()

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

  // Eagerly fetch all app users (equivalent to allProfiles in useProfile)
  const allAppUsers = await firestoreFetchCollection<AppUser>(
    `apps/${appId}/users`
  )

  return {
    // Current entity
    appUser,

    // Collections fetcher
    allAppUsers,

    // Child functions
    ...useAppUserEnsure(),
    ...useAppUserUtils(),
    useAppUserUpdate,
    ...useAppUserSubscription(appUser),
    ...useAppUserComputed(appUser),
  }
}
