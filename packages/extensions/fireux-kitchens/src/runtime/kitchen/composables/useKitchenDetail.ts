import { resolveReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
// Concurrent edit — 2026-07-24 18:04 CEST — Kitchen public family: resolve exact detail through the server projection.
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type {
  KitchenDetailPresentation,
  KitchenDetailResponse,
} from '../models/kitchen-detail.response.ts'
import type { Kitchen } from '../models/kitchen.model.ts'
import { resolveKitchenDetailPresentation } from '../utils/kitchen-detail-presentation.ts'

export type KitchenDetailOutcome =
  | 'idle'
  | 'pending'
  | 'ready'
  | 'missing'
  | 'error'

type KitchenDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseKitchenDetailReturn = KitchenDetailControls & {
  kitchen: ComputedRef<Kitchen | null>
  place: ComputedRef<Place | null>
  presentation: ComputedRef<KitchenDetailPresentation | null>
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
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

export function useKitchenDetail(
  kitchenSlug: MaybeRef<string | null | undefined>
): UseKitchenDetailReturn {
  const fireux = useFireUXConfig()
  const slug = computed(() =>
    String(unref(kitchenSlug) ?? '')
      .trim()
      .toLowerCase()
  )
  const state = useLiveAsyncData<KitchenDetailResponse | null>(
    () => ['kitchen-detail', fireux.appId, slug.value || 'none'].join('|'),
    async (liveFetch) => {
      if (!slug.value) return null
      return liveFetch<KitchenDetailResponse>(
        `/api/kitchens/${encodeURIComponent(slug.value)}`
      )
    },
    { server: true, watch: [slug] }
  )
  const loadedKitchen = computed<Kitchen | null>(() => {
    const item = state.data.value?.kitchen
    return !state.error.value &&
      !state.pending.value &&
      item?.slug.toLowerCase() === slug.value
      ? item
      : null
  })
  const loadedPlace = computed<Place | null>(() =>
    loadedKitchen.value ? state.data.value?.place || null : null
  )
  const kitchen = loadedKitchen
  const place = loadedPlace
  const presentation = computed<KitchenDetailPresentation | null>(() => {
    const base = state.data.value?.presentation
    return base && kitchen.value && place.value
      ? resolveKitchenDetailPresentation(base, kitchen.value, place.value)
      : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const outcome = computed<KitchenDetailOutcome>(() =>
    resolveReadOutcome({
      active: Boolean(slug.value),
      pending: state.pending.value,
      error: state.error.value,
      kind: 'document',
      present: Boolean(kitchen.value && place.value && presentation.value),
    })
  )
  const missing = computed(() => outcome.value === 'missing')
  const failed = computed(() => outcome.value === 'error')

  return {
    kitchen,
    place,
    presentation,
    ready: state.then(() => undefined),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    refresh: state.refresh,
    statusCode,
    missing,
    failed,
    outcome,
  }
}
