import { computed } from 'vue'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAppUserRead } from '../../app/composables/useAppUserRead'
import type { AppUser, AppUserWithId } from '../../app/models/app-user.model'
import { useUserRead } from './useUserRead'
import { useUserAccount } from './useUserAccount'
import { useUserBootstrap } from './useUserBootstrap'
import { useUserDelete } from './useUserDelete'
import { useUserProfileUpdate } from './firestore/mutations/useUserUpdate'
import { useUserSessionState } from './useUserSessionState'
import { useUserView } from './useUserView'

/** Auth plus the canonical live User and AppUser readers. */
export function useUserSession() {
  const { uid } = useAuth()
  const { appId } = useFireUXConfig()
  const identity = useUserRead(uid)
  const membership = useAppUserRead(appId, uid)
  const accountState = useUserAccount()

  const coreUser = identity.user
  const user = computed(() => coreUser.value ?? null)
  const coreOutcome = identity.outcome
  const corePending = identity.pending
  const coreError = identity.error
  const appUser = computed<AppUserWithId | null | undefined>(() => {
    const value = membership.appUser.value as AppUser | null | undefined
    if (!value) return value
    return uid.value ? { ...value, id: uid.value } : null
  })
  const appPending = membership.pending
  const appError = membership.error
  const appOutcome = computed(() => {
    if (!uid.value || !appId) return 'idle' as const
    if (appPending.value) return 'pending' as const
    if (appError.value) return 'error' as const
    return appUser.value ? ('ready' as const) : ('missing' as const)
  })
  const refs = {
    user,
    coreUser,
    pending: corePending,
    error: coreError,
    outcome: coreOutcome,
    corePending,
    coreError,
    coreOutcome,
    account: accountState.account,
    accountPending: accountState.pending,
    accountError: accountState.error,
    accountOutcome: computed(() => {
      if (!uid.value) return 'idle' as const
      if (accountState.pending.value) return 'pending' as const
      if (accountState.error.value) return 'error' as const
      return accountState.account.value ? ('ready' as const) : ('missing' as const)
    }),
    appUser,
    appPending,
    appError,
    appOutcome,
  }
  const { bootstrapUser } = useUserBootstrap()
  const { update: updateUser } = useUserProfileUpdate(refs)
  const { deleteUser } = useUserDelete()

  return {
    ...refs,
    create: bootstrapUser,
    update: updateUser,
    delete: () => deleteUser(uid.value || ''),
    ...useUserSessionState(refs, refs.pending),
    ...useUserView(refs.user),
  }
}

export type UserSession = ReturnType<typeof useUserSession>
