import { useAsyncData } from 'nuxt/app'
import { readPages } from 'fireux-core/runtime/composables/http/readPages'

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  BUSINESS_DIRECTORY_MAX_PAGE_SIZE,
  type BusinessDirectoryPage,
} from '../models/business-collection.model.ts'
import { BusinessStorage } from '../models/business.entity.ts'
import type { Business } from '../models/business.model.ts'

export type UseBusinessCollectionReturn = {
  collectionPath: ComputedRef<string>
  businesses: ComputedRef<Business[]>
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

export function useBusinessCollection(): UseBusinessCollectionReturn {
  const collectionPath = computed(() => BusinessStorage.collection)
  const pageCount = ref(1)
  const state = useAsyncData<BusinessDirectoryPage>(
    `business-collection|limit=${BUSINESS_DIRECTORY_MAX_PAGE_SIZE}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages<BusinessDirectoryPage>(
        fetchRead,
        `/api/businesses?limit=${BUSINESS_DIRECTORY_MAX_PAGE_SIZE}`,
        pageCount.value,
        {},
        ['businesses', 'places']
      )
    }
  )
  const businesses = computed(() => state.data.value?.businesses ?? [])
  const places = computed(() => state.data.value?.places ?? [])
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const nextCursor = computed(() => state.data.value?.nextCursor ?? '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const count = computed(() => businesses.value.length)
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
    businesses,
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
