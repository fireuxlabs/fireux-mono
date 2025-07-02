import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import { useFirestoreManager } from '../useFirestoreManager'
import type { AppUser } from '../../../models/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import { useAppUserUpdate } from './useAppUserUpdate'
import { useFireUXConfig } from '../../FireUXConfig'

export function useAppUser() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()
  const { appId } = useFireUXConfig()

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

  // Collections
  const appUsers = firestoreFetchCollection<AppUser>(`apps/${appId}/users`)

  // Computed properties
  const isAppUser = computed(() => !!appUser.value)
  const isPro = computed(() => appUser.value?.subscription?.is_pro === true)

  // Methods
  function hasSubscription(planType: 'pro' | 'enterprise' = 'pro'): boolean {
    if (planType === 'pro') {
      return isPro.value
    }
    return (
      appUser.value?.subscription?.plan === planType &&
      appUser.value?.subscription?.is_pro === true
    )
  }

  async function fetchAppUser(userId: string) {
    return await firestoreFetchDoc(`apps/${appId}/users`, userId)
  }

  return {
    // Current entity
    appUser,

    // Collections
    appUsers,

    // Computed properties
    isAppUser,
    isPro,

    // Methods
    hasSubscription,
    fetchAppUser,

    // Utilities
    ensureAppUser: useAppUserEnsure(),
    ...useAppUserUtils(),
    ...useAppUserUpdate(),
  }
}
