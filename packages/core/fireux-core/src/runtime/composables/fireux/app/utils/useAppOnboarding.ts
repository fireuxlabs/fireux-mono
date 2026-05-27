import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useToastify } from '../ui/useToastify'
import { useAuth } from '../../firebase/useAuth'
import { useUser } from '../../firestore/core/user/useUser'
import { useAppCreate } from '../../firestore/core/app/mutations/useAppCreate'
import { createUserAppMembership } from '../../firestore/core/user/utils/createHelpers'
import type { EnvCheckResponse } from './env-check.types'
import { useAppEnvCheck } from './useAppEnvCheck'

export interface AppOnboardingState {
  coreUser: Ref<ReturnType<typeof useUser>['coreUser']['value'] | null>
  isUnlocked: Ref<boolean>
  pin: Ref<number[]>
  pinError: Ref<string | null>
  pinLength: Ref<number>
  expectedPin: Ref<string>
  env: Ref<EnvCheckResponse | null>
  envError: Ref<string | null>
  pending: Ref<boolean>
  actionPending: Ref<boolean>
  canProceed: Ref<boolean>
  bypassWarning: Ref<boolean>
  proceedError: Ref<string | null>
  checkPin: () => void
  onRefreshEnv: () => void
  onProceed: () => Promise<void>
}

export function useAppOnboarding(): AppOnboardingState {
  const { developerPin, devMode } = useFireUXConfig()
  const { appId } = useFireUXConfig()
  const isDev = import.meta.dev

  const expectedPin = computed(() => {
    const raw = typeof developerPin === 'string' ? developerPin.trim() : ''
    const digits = raw.replaceAll(/\D/g, '')
    return digits || '1234'
  })

  const pinLength = computed(() => expectedPin.value.length)

  const { uid } = useAuth()
  const { coreUser: coreUserRef } = useUser()
  const coreUser = computed(() => coreUserRef.value ?? null)
  const toast = useToastify()

  const pin = ref<number[]>([])
  const pinError = ref<string | null>(null)
  const isUnlocked = ref(false)
  const actionPending = ref(false)
  const proceedError = ref<string | null>(null)

  const resetPin = () => {
    pin.value = []
  }

  const checkPin = () => {
    const entry = pin.value.join('')
    if (isDev) {
      console.info('[onboarding] checkPin', {
        entry,
        expected: expectedPin.value,
      })
    }
    if (entry === expectedPin.value) {
      isUnlocked.value = true
      pinError.value = null
    } else {
      pinError.value = 'Incorrect PIN. Try again.'
    }
    resetPin()
  }

  watch(coreUser, (value: typeof coreUser.value) => {
    if (!value) {
      isUnlocked.value = false
      pinError.value = null
      resetPin()
    }
  })

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

      // Self-heal existing apps stuck in "not initialized" when admin mirrors are empty.
      // After PIN, the current signed-in user becomes an admin for onboarding.
      const currentUid = String(uid.value ?? coreUser.value?.id ?? '').trim()
      if (!currentUid || !appId) {
        throw new Error('Authenticated user is not ready yet. Please try again.')
      }
      await createUserAppMembership(appId, currentUid, 'admin')

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
    isUnlocked,
    pin,
    pinError,
    pinLength,
    env,
    envError,
    pending: envPending,
    actionPending,
    canProceed,
    bypassWarning,
    proceedError,
    expectedPin,
    checkPin,
    onRefreshEnv,
    onProceed,
  }
}
