// Concurrent edit — 2026-07-21 14:30 CEST — Company public projection: replace raw Company and Place browser reads with complete-pair API reads.
import { useAsyncData } from '#imports'
import { computed, isRef, ref, type ComputedRef, type Ref } from 'vue'
import type {
  PublicCompanyDetailResponse,
  PublicCompanyIndexPage,
} from '../../../../../models/company-public.model'
import type { CompanyHydrated } from './types'

type CompanyIdInput = string | Ref<string | null | undefined>
type CompanyFetchFunction = (id: string) => Ref<CompanyHydrated | undefined>
type CompanyReadOutcome = 'idle' | 'pending' | 'error' | 'missing' | 'ready'
type CompanyFetchFactoryReturn = {
  companies: ComputedRef<CompanyHydrated[]>
  company: CompanyFetchFunction
}
type CompanyFetchDetailReturn = {
  company: ComputedRef<CompanyHydrated | null>
  pending: ComputedRef<boolean>
  error: Ref<unknown>
  outcome: ComputedRef<CompanyReadOutcome>
  refresh: () => Promise<void>
  ready: Promise<void>
  fetchCompany: CompanyFetchFunction
}

const cleanId = (value: unknown) => String(value ?? '').trim()

function createCompanyFetcher(): CompanyFetchFunction {
  const cache = new Map<string, Ref<CompanyHydrated | undefined>>()

  return (value: string) => {
    const id = cleanId(value)
    const existing = cache.get(id)
    if (existing) return existing

    const company = ref<CompanyHydrated>()
    cache.set(id, company)
    if (!id || import.meta.server) return company

    void $fetch<PublicCompanyDetailResponse>(
      `/api/companies/${encodeURIComponent(id)}`
    ).then(response => {
      company.value = response?.item
    }).catch(() => {
      company.value = undefined
    })
    return company
  }
}

export function useCompanyFetch(): CompanyFetchFactoryReturn
export function useCompanyFetch(id: CompanyIdInput): CompanyFetchDetailReturn
export function useCompanyFetch(
  id?: CompanyIdInput
): CompanyFetchFactoryReturn | CompanyFetchDetailReturn {
  const fetchCompany = createCompanyFetcher()

  if (id === undefined) {
    const state = useAsyncData<PublicCompanyIndexPage>(
      'public-company-index|limit=50',
      () => $fetch<PublicCompanyIndexPage>('/api/companies?limit=50')
    )
    return {
      companies: computed(() => state.data.value?.items ?? []),
      company: fetchCompany,
    }
  }

  const companyId = isRef(id)
    ? computed(() => cleanId(id.value))
    : computed(() => cleanId(id))
  const state = useAsyncData<PublicCompanyDetailResponse | null>(
    () => `public-company-detail|${companyId.value || 'none'}`,
    async () => {
      if (!companyId.value) return null
      return $fetch<PublicCompanyDetailResponse>(
        `/api/companies/${encodeURIComponent(companyId.value)}`
      )
    },
    { server: true, watch: [companyId] }
  )
  const company = computed<CompanyHydrated | null>(
    () => state.data.value?.item ?? null
  )
  const pending = computed(() => state.pending.value)
  const outcome = computed<CompanyReadOutcome>(() => {
    if (!companyId.value) return 'idle'
    if (state.pending.value) return 'pending'
    if (state.error.value) return 'error'
    return company.value ? 'ready' : 'missing'
  })

  return {
    company,
    pending,
    error: state.error as Ref<unknown>,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    fetchCompany,
  }
}
