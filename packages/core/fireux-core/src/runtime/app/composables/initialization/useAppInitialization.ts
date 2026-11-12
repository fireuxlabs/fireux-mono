import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useToastify } from '../../../composables/ui/useToastify'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import type { User } from '../../../user/models/user.model'
import { syncAppMediaToStorage } from '../media/sync-app-media'
import type { EnvCheckResponse } from '../../models/app-environment-check.ts'
import { initializeConfiguredApp } from './initialize-configured-app'
import { useAppEnvCheck } from './useAppEnvCheck'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
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
  const { user: userRef, pending: userPending } = useUserSession()
  const user = computed(() => userRef.value ?? null)
  const toast = useToastify()
  const { currentUser } = useAuth()
  const config = useFireUXConfig()
  const context = [
    () => currentUser.value?.uid,
    () => config.appId,
    () => user.value?.id,
  ]
  const captureIntent = useCommandScope(context)

  const actionPending = ref(false)
  const proceedError = ref<string | null>(null)
  let runSequence = 0
  watch(
    context,
    () => {
      runSequence += 1
      actionPending.value = false
      proceedError.value = null
    },
    { flush: 'sync' }
  )

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
      currentUser.value?.uid &&
        user.value &&
        !userPending.value &&
        !envPending.value &&
        !envError.value &&
        env.value?.isValid
    )
  )

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const onProceed = async () => {
    if (!canProceed.value || actionPending.value) return
    const isCurrent = captureIntent()
    const runId = ++runSequence
    actionPending.value = true
    proceedError.value = null
    try {
      const result = await initializeConfiguredApp()
      if (!isCurrent()) return
      const syncResult = await syncAppMediaToStorage()
      if (!isCurrent()) return
      if (syncResult.failed.length) {
        const detail = syncResult.failed
          .map((entry) => `${entry.kind}: ${entry.message}`)
          .join(' | ')
        throw new Error(`App setup is incomplete. ${detail}`)
      }

      await refreshEnv()
      if (!isCurrent()) return
      toast.success(
        result.ecosystemCreated
          ? result.appCreated
            ? 'Ecosystem and App initialized.'
            : 'Ecosystem setup repaired.'
          : result.appCreated
            ? 'App initialized.'
            : result.membershipCreated || result.membershipUpdated
              ? 'App access repaired.'
              : 'App is ready.'
      )
    } catch (e) {
      if (!isCurrent()) return
      const message =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : 'Failed to initialize App.'
      proceedError.value = message
      toast.error(message)
      console.error('[useAppInitialization] failed', e)
    } finally {
      if (isCurrent() && runId === runSequence) actionPending.value = false
    }
  }

  return {
    user,
    userPending,
    env,
    envError,
    pending: envPending,
    actionPending,
    canProceed,
    proceedError,
    onRefreshEnv,
    onProceed,
  }
}
