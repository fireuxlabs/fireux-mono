// Concurrent edit — 2026-07-20 16:35 CEST — Repo Efficiency Pass 1 of 6: authenticate diagnostics and identity-gate cached data.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish a portable async-data control surface.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtApp, NuxtError } from 'nuxt/app'
import { computed, type ComputedRef } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useDeveloperAccess } from '../useDeveloperAccess'
import type { EnvCheckResponse } from '../../models/app-environment-check'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../config/FireUXConfig'

type AppEnvCheckControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'status' | 'refresh' | 'execute' | 'clear'
>

export type UseAppEnvCheckReturn = AppEnvCheckControls & {
  data: ComputedRef<EnvCheckResponse | null>
}

export function useAppEnvCheck(): UseAppEnvCheckReturn {
  const { currentUser, hasAuthState } = useAuth()
  const { isDeveloper } = useDeveloperAccess()
  const config = useFireUXConfig()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    () => config.appId,
    isDeveloper,
    hasAuthState,
  ])
  const uid = computed(() =>
    isDeveloper.value ? String(currentUser.value?.uid ?? '').trim() : ''
  )

  const state = useAsyncData(
    () => `fireux-app-env-check:${config.appId}:${uid.value}`,
    async (_nuxtApp: NuxtApp, { signal }: { signal: AbortSignal }) => {
      const user = currentUser.value
      const requestUid = uid.value
      const requestAppId = config.appId
      const isCurrent = captureIntent()
      if (
        !import.meta.client ||
        !hasAuthState.value ||
        !user ||
        !isDeveloper.value ||
        user.uid !== requestUid
      ) {
        return null
      }
      try {
        const token = await user.getIdToken()
        if (!isCurrent()) return null
        const response = await $fetch<EnvCheckResponse>(
          '/api/internal/app/env-check',
          {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          }
        )
        return isCurrent() ? { requestUid, requestAppId, response } : null
      } catch (error) {
        if (!isCurrent()) return null
        throw error
      }
    },
    {
      server: false,
      lazy: true,
      watch: [hasAuthState],
    }
  )

  const data = computed<EnvCheckResponse | null>(() =>
    hasAuthState.value && isDeveloper.value &&
    !state.pending.value && !state.error.value &&
    state.data.value?.requestUid === uid.value &&
    state.data.value.requestAppId === config.appId
      ? state.data.value.response
      : null
  )

  return { ...state, data }
}
