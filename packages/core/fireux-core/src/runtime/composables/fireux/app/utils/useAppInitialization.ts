import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useToastify } from '../ui/useToastify'
import { useUser } from '../../user/useUser'
import { syncAppAssetsToStorage } from '../../firestore/core/app/utils/appAssetsSync'
import type { EnvCheckResponse } from './env-check.types'
import { initializeConfiguredApp } from './initializeConfiguredApp'
import { useAppEnvCheck } from './useAppEnvCheck'

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
      await options.onInitialized?.()

      const syncResult = await syncAppAssetsToStorage()
      await refreshEnv()

      if (syncResult.failed.length) {
        const detail = syncResult.failed
          .map((entry) => `${entry.kind}: ${entry.message}`)
          .join(' | ')
        proceedError.value = `App initialized, but some brand assets failed to sync to Storage. ${detail}`
        toast.warn(proceedError.value)
      } else {
        toast.success(
          result.appCreated
            ? 'App initialized.'
            : result.membershipCreated || result.membershipUpdated
              ? 'App access repaired.'
              : 'App is ready.'
        )
      }
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
