import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type {
  PublicCompanyDetailProjection,
  PublicCompanyDetailResponse,
} from '../../models/company-public.model.ts'

export type CompanyDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type CompanyDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseCompanyDetailReturn = CompanyDetailControls & {
  company: ComputedRef<PublicCompanyDetailProjection | null>
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
  const state = useAsyncData<PublicCompanyDetailResponse | null>(
    () => `company-detail|${id.value || 'none'}`,
    async () => {
      if (!id.value) return null
      return $fetch<PublicCompanyDetailResponse>(
        `/api/companies/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const company = computed<PublicCompanyDetailProjection | null>(() => {
    const item = state.data.value?.item
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !company.value)
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
