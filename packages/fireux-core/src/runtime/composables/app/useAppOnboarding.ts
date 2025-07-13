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

export function useAppOnboarding() {
  const envCheckResult = ref<EnvCheckResult | null>(null)
  const isEnvValid = computed(() => envCheckResult.value?.isValid ?? false)

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

  const { ensureApp } = useAppEnsure()

  async function createAppHandler() {
    try {
      await ensureApp()
    } catch (error) {
      console.error('❌ Error creating app:', error)
    }
  }

  return {
    checkEnv,
    createAppHandler,
    envCheckResult,
    isEnvValid,
  }
}
