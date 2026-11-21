import { computed, type Ref } from 'vue'
import { useUserRead } from '../../../user/composables/useUserRead'
import type { User } from '../../../user/models/user.model'
import type { EnvCheckResponse } from '../../contracts/environment-check.ts'
import { useAppEnvCheck } from './useAppEnvCheck'
import { useAppInitializationAction } from './internal/useAppInitializationAction'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../config/FireUXConfig'

export interface AppInitializationState {
  user: Ref<User | null>
  userPending: Ref<boolean>
  env: Ref<EnvCheckResponse | null>
  envError: Ref<string | null>
  pending: Ref<boolean>
  actionPending: Ref<boolean>
  canProceed: Ref<boolean>
  proceedError: Ref<string | null>
  onRefreshEnv: () => void
  onProceed: () => Promise<void>
}

/**
 * Initialize or repair the App declared by the current runtime. This is not
 * new-App onboarding and must not be mounted on `/apps/create`.
 */
export function useAppInitialization(): AppInitializationState {
  const { currentUser, hasAuthState, isAuthenticated } = useAuth()
  const uid = computed(() =>
    hasAuthState.value && isAuthenticated.value ? currentUser.value?.uid : ''
  )
  const { user: userRef, pending: userPending } = useUserRead(uid)
  const user = computed(() => userRef.value ?? null)
  const config = useFireUXConfig()
  const { data, pending, error, refresh: refreshEnv } = useAppEnvCheck()

  const env = computed(() => data.value ?? null)
  const envError = computed(() => {
    if (!error.value) return null
    if (error.value instanceof Error) return error.value.message
    return String(error.value)
  })

  const envPending = computed(() => Boolean(pending.value))
  const canProceed = computed(() =>
    Boolean(
      uid.value &&
        user.value?.id === uid.value &&
        !userPending.value &&
        !envPending.value &&
        !envError.value &&
        env.value?.isValid
    )
  )

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const action = useAppInitializationAction({
    intentSources: [
      () => currentUser.value?.uid,
      () => config.appId,
      () => user.value?.id,
    ],
    canProceed,
    refreshEnv,
  })

  return {
    user,
    userPending,
    env,
    envError,
    pending: envPending,
    canProceed,
    onRefreshEnv,
    ...action,
  }
}
