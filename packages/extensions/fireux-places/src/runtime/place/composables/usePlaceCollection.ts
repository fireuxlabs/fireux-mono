import { readLivePages } from 'fireux-core/runtime/composables/fireux/firestore/readLivePages'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  PLACE_INDEX_PAGE_SIZE,
  type PlaceIndexPage,
} from '../models/place-read.model.ts'
import type { Place } from '../models/place.model.ts'

export type UsePlaceCollectionReturn = {
  collection: ComputedRef<Place[]>
  count: ComputedRef<number>
  byId: ComputedRef<Map<string, Place>>
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

export function usePlaceCollection(): UsePlaceCollectionReturn {
  const pageCount = ref(1)
  const state = useLiveAsyncData<PlaceIndexPage>(
    `place-index|limit=${PLACE_INDEX_PAGE_SIZE}`,
    (liveFetch) =>
      readLivePages<PlaceIndexPage>(
        liveFetch,
        `/api/places?limit=${PLACE_INDEX_PAGE_SIZE}`,
        pageCount.value
      )
  )
  const collection = computed<Place[]>(() => state.data.value?.items ?? [])
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const nextCursor = computed(() => state.data.value?.nextCursor ?? '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const count = computed(() => collection.value.length)
  const pending = computed(() => state.pending.value)
  const error = computed<unknown | undefined>(
    () => state.error.value ?? undefined
  )
  const { outcome } = useFirestoreCollectionState({ count, error, pending })
  const byId = computed(() => {
    const map = new Map<string, Place>()
    for (const place of collection.value) {
      if (place?.id) map.set(String(place.id), place)
    }
    return map
  })

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
    collection,
    count,
    byId,
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
