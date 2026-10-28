import { useAsyncData } from 'nuxt/app'
import { readPages } from 'fireux-core/runtime/composables/http/readPages'

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  COMPANY_DIRECTORY_MAX_PAGE_SIZE,
  type CompanyDirectoryPage,
} from '../models/company-collection.model.ts'
import { CompanyStorage } from '../models/company.entity.ts'
import type { Company } from '../models/company.model.ts'

export type UseCompanyCollectionReturn = {
  collectionPath: ComputedRef<string>
  companies: ComputedRef<Company[]>
  places: ComputedRef<Place[]>
  count: ComputedRef<number>
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  refresh: () => Promise<void>
  ready: Promise<void>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function useCompanyCollection(): UseCompanyCollectionReturn {
  const collectionPath = computed(() => CompanyStorage.collection)
  const pageCount = ref(1)
  const state = useAsyncData<CompanyDirectoryPage>(
    `company-collection|limit=${COMPANY_DIRECTORY_MAX_PAGE_SIZE}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages<CompanyDirectoryPage>(
        fetchRead,
        `/api/companies?limit=${COMPANY_DIRECTORY_MAX_PAGE_SIZE}`,
        pageCount.value,
        {},
        ['companies', 'places']
      )
    }
  )
  const companies = computed(() => state.data.value?.companies ?? [])
  const places = computed(() => state.data.value?.places ?? [])
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const nextCursor = computed(() => state.data.value?.nextCursor ?? '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const count = computed(() => companies.value.length)
  const pending = computed(() => state.pending.value)
  const error = computed<unknown | undefined>(
    () => state.error.value ?? undefined
  )
  const { outcome } = useFirestoreCollectionState({ count, error, pending })

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return false
    loadingMore.value = true
    loadMoreError.value = null
    pageCount.value++
    try {
      await state.refresh()
      if (state.error.value) throw state.error.value
      return true
    } catch (error) {
      loadMoreError.value = error
      return false
    } finally {
      loadingMore.value = false
    }
  }

  return {
    collectionPath,
    companies,
    places,
    count,
    pending,
    error,
    outcome,
    refresh: async () => {
      await state.refresh()
    },
    ready: state.then(() => undefined),
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}
