import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { Ecosystem } from '../models/ecosystem.model.ts'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

export type EcosystemDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type EcosystemDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseEcosystemDetailReturn = EcosystemDetailControls & {
  ecosystem: ComputedRef<Ecosystem | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<EcosystemDetailOutcome>
}

function readStatusCode(error: unknown): number {
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

/** Resolve one canonical Ecosystem through the named Entity endpoint. */
export function useEcosystemDetail(
  routeEcosystemId: MaybeRef<string | null | undefined>
): UseEcosystemDetailReturn {
  const fireux = useFireUXConfig()
  const ecosystemId = computed(() =>
    String(unref(routeEcosystemId) ?? '').trim()
  )
  const state = useAsyncData<{ ecosystem: Ecosystem } | null>(
    () =>
      ['ecosystem-detail', fireux.appId, ecosystemId.value || 'none'].join('|'),
    async () => {
      if (!ecosystemId.value) return null
      return $fetch<{ ecosystem: Ecosystem }>(
        `/api/ecosystems/${encodeURIComponent(ecosystemId.value)}`
      )
    },
    { server: true, watch: [ecosystemId] }
  )
  const ecosystem = computed<Ecosystem | null>(() => {
    const item = state.data.value?.ecosystem ?? null
    return item?.id === ecosystemId.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !ecosystem.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<EcosystemDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    ecosystem,
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
