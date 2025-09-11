import { ref, computed, type Ref } from 'vue'
import { doc, type DocumentReference } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import { useFirestoreRead } from '../useFirestoreRead'
import type { AppUser } from '../../../models/core/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import useAppUserUpdate from './useAppUserUpdate'
import { useAppUserSubscription } from './useAppUserSubscription'
import { useAppUserComputed } from './useAppUserComputed'
import { useFireUXConfig } from '../../FireUXConfig'

export async function useAppUser() {
  // Get app ID dynamically from runtime config
  const { appId } = useFireUXConfig()

  const db = useFirestore()
  const { firestoreFetchCollection } = useFirestoreRead()

  // Guard useCurrentUser() for SSR/hydration; only access on client
  // useCurrentUser() returns Ref<User | null | undefined>; allow undefined in type to satisfy TS
  const currentUser = (import.meta.client
    ? (useCurrentUser() as Ref<{ uid: string } | null | undefined>)
    : ref(null)) as Ref<{ uid: string } | null | undefined>

  const appUserDocRef = computed<DocumentReference<AppUser> | null>(() => {
    if (!import.meta.client) return null
  if (!currentUser.value || !appId) return null
    return doc(
      db,
      `apps/${appId}/users`,
      currentUser.value.uid
    ) as DocumentReference<AppUser>
  })

  const { data: appUserData } = useDocument<AppUser>(appUserDocRef)

  // Convert undefined to null for consistency
  const appUser = computed(() => appUserData.value ?? null)

  // Avoid collection fetch without appId or on server
  const appUsers =
    appId && import.meta.client
      ? await firestoreFetchCollection<AppUser>(`apps/${appId}/users`)
      : []

  return {
    // Current entity
    appUser,

    // Collections fetcher
    appUsers,

    // Child functions
    ...useAppUserEnsure(),
    ...useAppUserUtils(),
    useAppUserUpdate,
    ...useAppUserSubscription(appUser),
    ...useAppUserComputed(appUser),
  }
}
