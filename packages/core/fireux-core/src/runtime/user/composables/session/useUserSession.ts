import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppUserRead } from '../../../app/app-user/composables/useAppUserRead'
import type { AppUser } from '../../../app/app-user/models/model'
import type { AppUserWithId } from '../../../app/app-user/types'
import { useUserRead } from '../useUserRead'
import { useUserSessionState } from './useUserSessionState'

/** Auth plus the canonical live User and AppUser readers. */
export function useUserSession() {
  const auth = useAuth()
  const { uid: authUid, isAuthenticated, hasAuthState } = auth
  const uid = computed(() =>
    hasAuthState.value && isAuthenticated.value
      ? String(authUid.value ?? '').trim()
      : ''
  )
  const { appId } = useFireUXConfig()
  const identity = useUserRead(uid)
  const membership = useAppUserRead(appId, uid)

  const user = identity.user
  const userOutcome = identity.outcome
  const userPending = identity.pending
  const userError = identity.error
  const appUser = computed<AppUserWithId | null | undefined>(() => {
    const value = membership.appUser.value as AppUser | null | undefined
    if (value === undefined) return undefined
    if (value === null) return null
    return uid.value ? { ...value, id: uid.value } : null
  })
  const appUserPending = membership.pending
  const appUserError = membership.error
  const appUserOutcome = membership.outcome
  const refs = {
    user,
    userPending,
    userError,
    userOutcome,
    appUser,
    appUserPending,
    appUserError,
    appUserOutcome,
  }
  return {
    ...refs,
    ...useUserSessionState(refs, auth),
  }
}

export type UserSession = ReturnType<typeof useUserSession>
