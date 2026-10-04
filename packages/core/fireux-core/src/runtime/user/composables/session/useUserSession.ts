import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppUserRead } from '../../../app/composables/membership/useAppUserRead'
import type { AppUser, AppUserWithId } from '../../../app/models/app-user.model'
import { useUserRead } from '../useUserRead'
import { useUserSessionState } from './useUserSessionState'

/** Auth plus the canonical live User and AppUser readers. */
export function useUserSession() {
  const { uid } = useAuth()
  const { appId } = useFireUXConfig()
  const identity = useUserRead(uid)
  const membership = useAppUserRead(appId, uid)

  const coreUser = identity.user
  const user = computed(() => coreUser.value ?? null)
  const coreOutcome = identity.outcome
  const corePending = identity.pending
  const coreError = identity.error
  const appUser = computed<AppUserWithId | null | undefined>(() => {
    const value = membership.appUser.value as AppUser | null | undefined
    if (value === undefined) return undefined
    if (value === null) return null
    return uid.value ? { ...value, id: uid.value } : null
  })
  const appPending = membership.pending
  const appError = membership.error
  const appOutcome = membership.outcome
  const refs = {
    user,
    coreUser,
    corePending,
    coreError,
    coreOutcome,
    appUser,
    appPending,
    appError,
    appOutcome,
  }
  return {
    ...refs,
    ...useUserSessionState(refs),
  }
}

export type UserSession = ReturnType<typeof useUserSession>
