import { useAsyncData } from 'nuxt/app'
import { resolveHttpDocumentOutcome } from 'fireux-core/runtime/utils/http-document-outcome'

import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Business } from 'fireux-businesses/runtime/business/models/business.model'
import type { Supplier } from '../models/Supplier.model.ts'

export type SupplierDetailOutcome = 'pending' | 'ready' | 'empty' | 'error'

type SupplierDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseSupplierDetailReturn = SupplierDetailControls & {
  supplier: ComputedRef<Supplier | null>
  business: ComputedRef<Business | null>
  place: ComputedRef<Place | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  empty: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<SupplierDetailOutcome>
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

export function useSupplierDetail(
  supplierId: MaybeRef<string | null | undefined>
): UseSupplierDetailReturn {
  const fireux = useFireUXConfig()
  const id = computed(() => String(unref(supplierId) ?? '').trim())
  const key = computed(() =>
    ['supplier-detail', fireux.appId, id.value || 'none'].join('|')
  )
  const state = useAsyncData<{
    key: string
    supplier: Supplier
    business: Business
    place: Place
  } | null>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })

      if (!id.value) return null
      const requestKey = key.value
      const data = await fetchRead<{
        supplier: Supplier
        business: Business
        place: Place
      }>(`/api/suppliers/${encodeURIComponent(id.value)}`)
      return { ...data, key: requestKey }
    },
    { server: true, watch: [id] }
  )
  const statusCode = computed(() => readStatusCode(state.error.value))
  const outcome = computed<SupplierDetailOutcome>(() => {
    if (!id.value) return 'empty'
    if (state.data.value && state.data.value.key !== key.value) return 'pending'
    const result = resolveHttpDocumentOutcome({
      enabled: Boolean(id.value),
      pending: state.pending.value,
      error: state.error.value,
      present: state.data.value?.supplier?.id === id.value,
    })
    return result === 'idle' ? 'empty' : result
  })
  // The server projection already follows Supplier, Business and Place live.
  // Never retain an old identity or add raw browser listeners beside it.
  const supplier = computed(() =>
    outcome.value === 'ready' ? (state.data.value?.supplier ?? null) : null
  )
  const business = computed(() =>
    outcome.value === 'ready' ? (state.data.value?.business ?? null) : null
  )
  const place = computed(() =>
    outcome.value === 'ready' ? (state.data.value?.place ?? null) : null
  )
  const empty = computed(() => outcome.value === 'empty')
  const failed = computed(() => outcome.value === 'error')

  return {
    supplier,
    business,
    place,
    ready: state.then(() => undefined),
    pending: computed(() => outcome.value === 'pending'),
    error: state.error,
    refresh: state.refresh,
    statusCode,
    empty,
    failed,
    outcome,
  }
}
