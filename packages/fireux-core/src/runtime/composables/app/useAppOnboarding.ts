// ~/composables/useAppOnboarding.ts

import { ref, computed } from 'vue'
import { useRuntimeConfig, useFetch } from 'nuxt/app'
import { useCoreUser } from '../firestore/CoreUser/useCoreUser'
import { useAppEnsure } from './useEnsureApp'

export interface EnvCheckResult {
  isValid: boolean
  requiredVars: Record<string, string>
  missingVars: string[]
}

export async function useAppOnboarding() {
  const pin = ref<string[]>([])
  const isUnlocked = ref(false)
  const { coreUser } = await useCoreUser()

  const showPin = computed(() => !!coreUser.value)

  const { PIN } = useRuntimeConfig().public

  const envCheckResult = ref<EnvCheckResult | null>(null)
  const isEnvValid = computed(() => envCheckResult.value?.isValid ?? false)

  function checkPin() {
    if (pin.value.join('') === PIN) {
      isUnlocked.value = true
    }
  }

  async function checkEnv() {
    const { data } = await useFetch<EnvCheckResult>('/api/env-check', {
      server: false,
    })
    envCheckResult.value = data.value ?? {
      isValid: false,
      requiredVars: {},
      missingVars: [],
    }
    return envCheckResult.value
  }

  const { ensureApp } = await useAppEnsure()

  async function createAppHandler() {
    try {
      await ensureApp()
    } catch (error) {
      console.error('❌ Error creating app:', error)
    }
  }

  return {
    pin,
    isUnlocked,
    showPin,
    checkPin,
    checkEnv,
    createAppHandler,
    envCheckResult,
    isEnvValid,
  }
}
