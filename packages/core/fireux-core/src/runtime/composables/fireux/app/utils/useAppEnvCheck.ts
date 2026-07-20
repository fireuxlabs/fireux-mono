// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: authenticate diagnostics and identity-gate cached data.
import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useAuth } from '../../firebase/useAuth'
import type { EnvCheckResponse } from './env-check.types'

export function useAppEnvCheck() {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())

  const state = useAsyncData(
    'fireux-app-env-check',
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return null
      }
      const token = await user.getIdToken()
      const response = await $fetch<EnvCheckResponse>(
        '/api/internal/app/env-check',
        {
        headers: { Authorization: `Bearer ${token}` },
        }
      )
      return { requestUid, response }
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState, uid],
    }
  )

  const data = computed<EnvCheckResponse | null>(() =>
    state.data.value?.requestUid === uid.value
      ? state.data.value.response
      : null
  )

  return { ...state, data }
}
