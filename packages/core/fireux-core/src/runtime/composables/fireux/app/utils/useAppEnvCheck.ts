// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: authenticate diagnostics and identity-gate cached data.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish a portable async-data control surface.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import { useAuth } from '../../firebase/useAuth'
import type { EnvCheckResponse } from './env-check.types'

type AppEnvCheckControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'status' | 'refresh' | 'execute' | 'clear'
>

export type UseAppEnvCheckReturn = AppEnvCheckControls & {
  data: ComputedRef<EnvCheckResponse | null>
}

export function useAppEnvCheck(): UseAppEnvCheckReturn {
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
