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
  const { firestoreFetchCollection, firestoreFetchDoc } = useFirestoreManager()

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

  // Computed properties
  const isAppUser = computed(() => !!appUser.value)
  const isPro = computed(() => appUser.value?.subscription?.is_pro === true)
  const isAdmin = computed(() => appUser.value?.role === 'admin')

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

  // Get ensure function directly - it's synchronous and returns a function
  const ensureAppUser = useAppUserEnsure()

  return {
    // Current entity
    appUser,

    // Collections
    appUsers,

    // Computed properties
    isAppUser,
    isPro,
    isAdmin,

    // Methods
    hasSubscription,
    fetchAppUser,

    // Utilities
    ensureAppUser,
    ...useAppUserUtils(),
    ...useAppUserUpdate(),
    ...useAppUserSubscription(appUser),
  }
}
