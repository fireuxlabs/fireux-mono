import { useAsyncData } from 'nuxt/app'

import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { BusinessDetailResponse } from '../../models/business-collection.model.ts'
import type { Business } from '../../models/business.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'

export type BusinessDetailOutcome = 'pending' | 'ready' | 'empty' | 'error'

type BusinessDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseBusinessDetailReturn = BusinessDetailControls & {
  business: ComputedRef<Business | null>
  place: ComputedRef<Place | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  empty: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<BusinessDetailOutcome>
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

export function useBusinessDetail(
  businessId: MaybeRef<string | null | undefined>
): UseBusinessDetailReturn {
  const id = computed(() => String(unref(businessId) ?? '').trim())
  const state = useAsyncData<BusinessDetailResponse | null>(
    () => `business-detail|${id.value || 'none'}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (!id.value) return null
      return fetchRead<BusinessDetailResponse>(
        `/api/businesses/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const business = computed<Business | null>(() => {
    const item = state.data.value?.business
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const place = computed<Place | null>(() => {
    const item = state.data.value?.place
    return item && state.data.value?.business.id === id.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const empty = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value &&
        !state.error.value &&
        !business.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<BusinessDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (empty.value) return 'empty'
    return 'ready'
  })

  return {
    business,
    place,
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    statusCode,
    empty,
    failed,
    outcome,
  }
}
