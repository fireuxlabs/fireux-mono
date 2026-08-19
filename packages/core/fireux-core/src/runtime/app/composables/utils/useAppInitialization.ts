import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useToastify } from '../../../composables/ui/useToastify'
import { useUser } from '../../../user/composables/useUser'
import { syncAppMediaToStorage } from '../firestore/utils/appMediaSync'
import type { EnvCheckResponse } from '../onboarding/env-check.types.ts'
import { initializeConfiguredApp } from './initializeConfiguredApp'
import { useAppEnvCheck } from '../onboarding/useAppEnvCheck'

export interface AppInitializationState {
  coreUser: Ref<ReturnType<typeof useUser>['coreUser']['value'] | null>
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
export function useAppInitialization(
  options: { onInitialized?: () => void | Promise<void> } = {}
): AppInitializationState {
  const { coreUser: coreUserRef, isLoading: userPending } = useUser()
  const coreUser = computed(() => coreUserRef.value ?? null)
  const toast = useToastify()

  const actionPending = ref(false)
  const proceedError = ref<string | null>(null)

  const { data, pending, error, refresh: refreshEnv } = useAppEnvCheck()

  const env = computed(() => data.value ?? null)
  const envError = computed(() => {
    if (!error.value) return null
    if (error.value instanceof Error) return error.value.message
    return String(error.value)
  })

  const envPending = computed(() => Boolean(pending.value))
  const canProceed = computed(() => Boolean(env.value?.isValid))

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const onProceed = async () => {
    if (!canProceed.value || actionPending.value) return
    actionPending.value = true
    proceedError.value = null
    try {
      const result = await initializeConfiguredApp()
      const syncResult = await syncAppMediaToStorage()
      if (syncResult.failed.length) {
        const detail = syncResult.failed
          .map((entry) => `${entry.kind}: ${entry.message}`)
          .join(' | ')
        throw new Error(`App setup is incomplete. ${detail}`)
      }

      await refreshEnv()
      await options.onInitialized?.()
      toast.success(
        result.appCreated
          ? 'App initialized.'
          : result.membershipCreated || result.membershipUpdated
            ? 'App access repaired.'
            : 'App is ready.'
      )
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : 'Failed to initialize App.'
      proceedError.value = message
      toast.error(message)
      console.error('[useAppInitialization] failed', e)
    } finally {
      actionPending.value = false
    }
  }

  return {
    coreUser,
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
