// Concurrent edit — 2026-07-24 18:04 CEST — Kitchen public family: resolve exact detail through the server projection.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type {
  PublicKitchenDetail,
  PublicKitchenDetailResponse,
} from '../models/kitchen-index.model.ts'

export type KitchenDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type KitchenDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseKitchenDetailReturn = KitchenDetailControls & {
  kitchen: ComputedRef<PublicKitchenDetail | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<KitchenDetailOutcome>
}

function readStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ??
    candidate.status ??
    candidate.response?.status ??
    0
  )
}

export function useKitchenDetail(
  kitchenSlug: MaybeRef<string | null | undefined>
): UseKitchenDetailReturn {
  const fireux = useFireUXConfig()
  const slug = computed(() =>
    String(unref(kitchenSlug) ?? '').trim().toLowerCase()
  )
  const state = useAsyncData<PublicKitchenDetailResponse | null>(
    () => [
      'kitchen-detail',
      fireux.appId,
      slug.value || 'none',
    ].join('|'),
    async () => {
      if (!slug.value) return null
      return $fetch<PublicKitchenDetailResponse>(
        `/api/kitchens/${encodeURIComponent(slug.value)}`
      )
    },
    { server: true, watch: [slug] }
  )
  const kitchen = computed<PublicKitchenDetail | null>(() => {
    const item = state.data.value?.item
    return item &&
      item.slug.toLowerCase() === slug.value &&
      !state.pending.value
      ? item
      : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(() =>
    statusCode.value === 404 ||
    (!state.pending.value && !state.error.value && !kitchen.value)
  )
  const failed = computed(() =>
    Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<KitchenDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    kitchen,
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
