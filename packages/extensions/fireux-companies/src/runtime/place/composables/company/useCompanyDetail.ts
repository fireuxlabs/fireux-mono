import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type {
  CompanyDetailResponse,
} from '../../models/company-directory.model.ts'
import type { Company } from '../../models/company.model.ts'
import type { Place } from 'fireux-places/runtime/place/models/place.model'

export type CompanyDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type CompanyDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseCompanyDetailReturn = CompanyDetailControls & {
  company: ComputedRef<Company | null>
  place: ComputedRef<Place | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<CompanyDetailOutcome>
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

export function useCompanyDetail(
  companyId: MaybeRef<string | null | undefined>
): UseCompanyDetailReturn {
  const id = computed(() => String(unref(companyId) ?? '').trim())
  const state = useAsyncData<CompanyDetailResponse | null>(
    () => `company-detail|${id.value || 'none'}`,
    async () => {
      if (!id.value) return null
      return $fetch<CompanyDetailResponse>(
        `/api/companies/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const company = computed<Company | null>(() => {
    const item = state.data.value?.company
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const place = computed<Place | null>(() => {
    const item = state.data.value?.place
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value &&
        !state.error.value &&
        (!company.value || !place.value))
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<CompanyDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
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
