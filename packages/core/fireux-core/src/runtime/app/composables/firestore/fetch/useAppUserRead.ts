import { computed, isRef, type Ref } from 'vue'
import type { CurrentAppMembership } from '../../../models/app-context.model.ts'
import { useFireUXConfig } from '../../config/FireUXConfig'
import { useCurrentAppContext } from '../../useCurrentAppContext'

export type AppUserReadOutcome = 'idle' | 'pending' | 'ready' | 'missing' | 'error'

/** Read the signed-in User's membership in the configured App. */
export function useCurrentAppUserRead(
  userId: string | null | undefined | Ref<string | null | undefined>
) {
  const { appId } = useFireUXConfig()
  const uid = computed(() => (isRef(userId) ? userId.value : userId) ?? '')

  if (import.meta.server) {
    return {
      appUser: computed<CurrentAppMembership | null | undefined>(() => null),
      appPending: computed(() => false),
      appError: computed<unknown>(() => null),
      appOutcome: computed<AppUserReadOutcome>(() => 'idle'),
    }
  }

  const context = useCurrentAppContext()
  const requested = computed(() => Boolean(uid.value && appId))
  const identityError = computed<Error | null>(() => {
    if (!requested.value || context.pending.value) return null
    return uid.value === context.uid.value
      ? null
      : new Error('[useCurrentAppUserRead] Membership is only available for the signed-in User.')
  })
  const appPending = computed(() => requested.value && context.pending.value)
  const appError = computed<unknown>(() =>
    requested.value ? identityError.value || context.error.value || null : null
  )
  const appUser = computed<CurrentAppMembership | null | undefined>(() => {
    if (!requested.value) return null
    if (appPending.value || appError.value) return undefined
    return context.membership.value
  })
  const appOutcome = computed<AppUserReadOutcome>(() => {
    if (!requested.value) return 'idle'
    if (appPending.value) return 'pending'
    if (appError.value) return 'error'
    return appUser.value ? 'ready' : 'missing'
  })

  return { appUser, appPending, appError, appOutcome }
}

export type CurrentAppUserRead = ReturnType<typeof useCurrentAppUserRead>
