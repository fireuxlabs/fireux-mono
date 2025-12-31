import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../FireUXConfig'
import { useUser } from '../../firestore/core/user/useUser'
import { useAppEnsure } from '../../firestore/core/app/mutations/useAppEnsure'
import type { EnvCheckResponse } from '../../../../../types/app/onboarding'
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
  canProceed: Ref<boolean>
  bypassWarning: Ref<boolean>
  checkPin: () => void
  onRefreshEnv: () => void
  onProceed: () => Promise<void>
}

export function useAppOnboarding(): AppOnboardingState {
  const { developerPin, devMode } = useFireUXConfig()
  const isDev = import.meta.dev

  const expectedPin = computed(() => {
    const raw = typeof developerPin === 'string' ? developerPin.trim() : ''
    const digits = raw.replaceAll(/\D/g, '')
    return digits || '1234'
  })

  const pinLength = computed(() => expectedPin.value.length)

  const { coreUser: coreUserRef } = useUser()
  const coreUser = computed(() => coreUserRef.value ?? null)

  const pin = ref<number[]>([])
  const pinError = ref<string | null>(null)
  const isUnlocked = ref(false)

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

  const { ensureApp } = useAppEnsure()

  const onRefreshEnv = () => {
    void refreshEnv()
  }

  const onProceed = async () => {
    if (!canProceed.value) return
    try {
      const ensured = await ensureApp()
      console.log('[proceed] ensureApp result', ensured)
    } catch (e) {
      console.error('[proceed] ensureApp failed', e)
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
    canProceed,
    bypassWarning,
    expectedPin,
    checkPin,
    onRefreshEnv,
    onProceed,
  }
}
