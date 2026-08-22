import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  computed,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type MaybeRef,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import { SupplierStorage, type Supplier } from '../models/Supplier.model.ts'
import { normalizeSupplier } from '../utils/normalize-supplier'

export type SupplierDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type SupplierDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseSupplierDetailReturn = SupplierDetailControls & {
  supplier: ComputedRef<Supplier | null>
  company: ComputedRef<Company | null>
  place: ComputedRef<Place | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
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
  const id = computed(() =>
    String(unref(supplierId) ?? '')
      .trim()
      .toLowerCase()
  )
  const state = useAsyncData<{
    supplier: Supplier
    company: Company
    place: Place
  } | null>(
    () => ['supplier-detail', fireux.appId, id.value || 'none'].join('|'),
    async () => {
      if (!id.value) return null
      return $fetch<{ supplier: Supplier; company: Company; place: Place }>(
        `/api/suppliers/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const loadedSupplier = computed<Supplier | null>(() => {
    const item = state.data.value?.supplier
    return item?.id.toLowerCase() === id.value ? item : null
  })
  const loadedPlace = computed<Place | null>(() =>
    loadedSupplier.value ? state.data.value?.place || null : null
  )
  const company = computed<Company | null>(() =>
    loadedSupplier.value ? state.data.value?.company || null : null
  )
  const liveSupplierId = computed(() =>
    import.meta.client ? loadedSupplier.value?.id || '' : ''
  )
  const livePlaceId = computed(() =>
    import.meta.client ? loadedPlace.value?.id || '' : ''
  )
  const { firestoreFetchDoc } = useFirestoreRead()
  const liveSupplierRead = firestoreFetchDoc<Supplier>(
    SupplierStorage.collection,
    liveSupplierId
  )
  const livePlaceRead = firestoreFetchDoc<Place>(
    'places',
    livePlaceId
  )
  const liveSupplier = computed<Supplier | null>(() =>
    normalizeSupplier(liveSupplierId.value, liveSupplierRead.value)
  )
  const livePlace = computed(() =>
    normalizePlace(livePlaceId.value, livePlaceRead.value)
  )
  const lastGoodSupplier = shallowRef<Supplier | null>(null)
  const lastGoodPlace = shallowRef<Place | null>(null)
  watch(
    [loadedSupplier, liveSupplier],
    ([loaded, live]) => {
      if (live) lastGoodSupplier.value = live
      else if (loaded) lastGoodSupplier.value = loaded
    },
    { immediate: true }
  )
  watch(
    [loadedPlace, livePlace],
    ([loaded, live]) => {
      if (live) lastGoodPlace.value = live
      else if (loaded) lastGoodPlace.value = loaded
    },
    { immediate: true }
  )
  const supplier = computed(
    () => lastGoodSupplier.value || loadedSupplier.value || liveSupplier.value
  )
  const place = computed(
    () => lastGoodPlace.value || loadedPlace.value || livePlace.value
  )
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !supplier.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<SupplierDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    supplier,
    company,
    place,
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
