import { computed, isRef, type Ref } from 'vue'
import type { AppUserWithId } from '../models/app-user.model.ts'
import { useFireUXConfig } from './config/FireUXConfig'
import { useAppUserRead } from './useAppUserRead'

export type AppUserReadOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

/** Read the signed-in User's membership in the configured App. */
export function useAppUserSessionRead(
  userId: string | null | undefined | Ref<string | null | undefined>
) {
  const { appId } = useFireUXConfig()
  const uid = computed(() => (isRef(userId) ? userId.value : userId) ?? '')

  if (import.meta.server) {
    return {
      appUser: computed<AppUserWithId | null | undefined>(() => null),
      appPending: computed(() => false),
      appError: computed<unknown>(() => null),
      appOutcome: computed<AppUserReadOutcome>(() => 'idle'),
    }
  }

  const source = useAppUserRead(appId, uid)
  const requested = computed(() => Boolean(uid.value && appId))
  const appPending = computed(() => requested.value && source.pending.value)
  const appError = computed<unknown>(() =>
    requested.value ? source.error.value || null : null
  )
  const appUser = computed<AppUserWithId | null | undefined>(() => {
    if (!requested.value) return null
    if (appPending.value || appError.value) return undefined
    const value = source.appUser.value
    return value ? { id: uid.value, ...value } : null
  })
  const appOutcome = computed<AppUserReadOutcome>(() => {
    if (!requested.value) return 'idle'
    if (appPending.value) return 'pending'
    if (appError.value) return 'error'
    return appUser.value ? 'ready' : 'missing'
  })

  return { appUser, appPending, appError, appOutcome }
}

export type AppUserSessionRead = ReturnType<typeof useAppUserSessionRead>
