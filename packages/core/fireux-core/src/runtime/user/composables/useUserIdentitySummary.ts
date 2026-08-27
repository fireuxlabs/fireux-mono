// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: read claimant identity through the exact public API.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { DetailResponse } from '../../models/utils/directory.ts'
import type { UserIdentitySummary } from '../models/user-collection.model.ts'

export type UserIdentitySummaryOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

export const userIdentitySummaryAsyncDataKey = (id: string) =>
  `user-identity-summary-${id || 'none'}`

type UserIdentitySummaryControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseUserIdentitySummaryReturn = UserIdentitySummaryControls & {
  user: ComputedRef<UserIdentitySummary | null>
  outcome: ComputedRef<UserIdentitySummaryOutcome>
}

function statusCode(error: unknown) {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

export function useUserIdentitySummary(
  userId: MaybeRef<string | null | undefined>
): UseUserIdentitySummaryReturn {
  const id = computed(() => String(unref(userId) ?? '').trim())
  const state = useAsyncData(
    () => userIdentitySummaryAsyncDataKey(id.value),
    async () => {
      if (!id.value) return null
      try {
        return await $fetch<DetailResponse<UserIdentitySummary>>(
          `/api/user-identities/${encodeURIComponent(id.value)}`
        )
      } catch (cause) {
        if (statusCode(cause) === 404) return null
        throw cause
      }
    },
    { server: true, watch: [id] }
  )

  const user = computed<UserIdentitySummary | null>(() => {
    const item = state.data.value?.item
    return item?.id === id.value ? item : null
  })
  const outcome = computed<UserIdentitySummaryOutcome>(() => {
    if (!id.value) return 'idle'
    if (state.pending.value) return 'pending'
    if (state.error.value) return 'error'
    return user.value ? 'ready' : 'missing'
  })

  return {
    user,
    pending: state.pending,
    error: state.error,
    outcome,
    refresh: state.refresh,
  }
}
