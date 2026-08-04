import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useToastify } from '../ui/useToastify'
import { useAuth } from '../../firebase/useAuth'
import { useUser } from '../../firestore/core/user/useUser'
import { useAppCreate } from '../../firestore/core/app/mutations/useAppCreate'
import { bootstrapAppUserAdmin } from '../../firestore/core/user/utils/createHelpers'
import type { EnvCheckResponse } from './env-check.types'
import { useAppEnvCheck } from './useAppEnvCheck'

export interface AppOnboardingState {
  coreUser: Ref<ReturnType<typeof useUser>['coreUser']['value'] | null>
  env: Ref<EnvCheckResponse | null>
  envError: Ref<string | null>
  pending: Ref<boolean>
  actionPending: Ref<boolean>
  canProceed: Ref<boolean>
  bypassWarning: Ref<boolean>
  proceedError: Ref<string | null>
  onRefreshEnv: () => void
  onProceed: () => Promise<void>
}

export function useAppOnboarding(
  options: { onInitialized?: () => void | Promise<void> } = {}
): AppOnboardingState {
  const { appId, devMode } = useFireUXConfig()

  const { uid } = useAuth()
  const { coreUser: coreUserRef } = useUser()
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
  const canProceed = computed(
    () => Boolean(env.value?.isValid) || Boolean(devMode)
  )
  const bypassWarning = computed(() => !env.value?.isValid && Boolean(devMode))

  const { createApp, syncAppMedia } = useAppCreate()

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const onProceed = async () => {
    if (!canProceed.value || actionPending.value) return
    actionPending.value = true
    proceedError.value = null
    try {
      const created = await createApp()
      console.log('[proceed] createApp result', created)

      // The server verifies the authenticated uid against the configured
      // developer and refuses bootstrap once another canonical App admin exists.
      const currentUid = String(uid.value ?? coreUser.value?.id ?? '').trim()
      if (!currentUid || !appId) {
        throw new Error(
          'Authenticated user is not ready yet. Please try again.'
        )
      }
      await bootstrapAppUserAdmin(appId, currentUid)
      await options.onInitialized?.()

      const syncResult = await syncAppMedia(created.id)
      await refreshEnv()

      if (syncResult.failed.length) {
        const detail = syncResult.failed
          .map((entry) => `${entry.kind}: ${entry.message}`)
          .join(' | ')
        proceedError.value = `App initialized, but some brand assets failed to sync to Storage. ${detail}`
        toast.warn(proceedError.value)
      } else {
        toast.success(created.created ? 'App initialized.' : 'App repaired.')
      }
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim()
          ? e.message.trim()
          : 'Failed to continue onboarding.'
      proceedError.value = message
      toast.error(message)
      console.error('[proceed] createApp failed', e)
    } finally {
      actionPending.value = false
    }
  }

  return {
    coreUser,
    env,
    envError,
    pending: envPending,
    actionPending,
    canProceed,
    bypassWarning,
    proceedError,
    onRefreshEnv,
    onProceed,
  }
}
