import { computed } from 'vue'
import { doc } from 'firebase/firestore'
import { useFirestore, useDocument, useCurrentUser } from 'vuefire'
import type { DocumentReference } from 'firebase/firestore'
import type { AppUser } from '../../../models/appUser.model'
import { useAppUserUtils } from './useAppUserUtils'
import { useAppUserEnsure } from './useAppUserEnsure'
import { useAppUserUpdate } from './useAppUserUpdate'
import { useFireUXConfig } from '../../FireUXConfig'

export function useAppUser() {
  const db = useFirestore()
  const currentUser = useCurrentUser()
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

  const isAppUser = computed(() => !!appUser.value)
  const isAdmin = computed(() => appUser.value?.role === 'admin')
  const isPro = computed(() => appUser.value?.subscription?.is_pro === true)

  /**
   * Check if user has a specific subscription plan
   */
  function hasSubscription(
    planType: 'pro' | 'premium' | 'enterprise' = 'pro'
  ): boolean {
    if (planType === 'pro') {
      return isPro.value
    }
    return (
      appUser.value?.subscription?.plan === planType &&
      appUser.value?.subscription?.is_pro === true
    )
  }


  const subscriptionPlan = computed(
    () => appUser.value?.subscription?.plan || 'free'
  )

  return {
    appUser,
    isAdmin,
    isPro,
    isAppUser,
    hasSubscription,
    subscriptionPlan,
    ...useAppUserUtils(),
    ensureAppUser: useAppUserEnsure(),
    ...useAppUserUpdate(),
  }
}
