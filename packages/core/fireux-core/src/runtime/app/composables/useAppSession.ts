import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { AppUserWithId } from '../models/app-user.model.ts'
import type { App } from '../models/app.model.ts'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useAppRead } from './useAppRead'
import { useAppUserRead } from './useAppUserRead'
import { useFireUXConfig } from './config/FireUXConfig'

export type UseAppSessionReturn = {
  uid: ComputedRef<string>
  app: ComputedRef<App | null>
  appUser: ComputedRef<AppUserWithId | null>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

/** Live composition. Firestore listeners remain the only runtime truth. */
export function useAppSession(): UseAppSessionReturn {
  const { currentUser, hasAuthState } = useAuth()
  const { appId } = useFireUXConfig()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const appState = useAppRead(appId)
  const appUserState = useAppUserRead(appId, uid)
  const app = computed<App | null>(() => appState.app.value ?? null)
  const appUser = computed<AppUserWithId | null>(() => {
    const value = appUserState.appUser.value
    return value && uid.value ? { id: uid.value, ...value } : null
  })
  const pending = computed(() => !hasAuthState.value || appState.pending.value || (Boolean(uid.value) && appUserState.pending.value))
  const error = computed<unknown | undefined>(() => appState.error.value || appUserState.error.value || undefined)

  return {
    uid,
    app,
    appUser,
    pending,
    error,
  }
}
