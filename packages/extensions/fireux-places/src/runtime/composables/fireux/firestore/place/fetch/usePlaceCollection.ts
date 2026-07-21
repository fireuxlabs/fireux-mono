// Concurrent edit — 2026-07-21 14:38 CEST — Place public projection: consume and paginate the bounded public directory instead of raw roots.
import { useAsyncData } from '#imports'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import {
  PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE,
  type PublicPlaceIndexPage,
  type PublicPlaceProjection,
} from 'fireux-places/runtime/models/place-public.model'
import type { Place } from 'fireux-places/runtime/models/place.model'

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
  const state = useAsyncData<PublicPlaceIndexPage>(
    `public-place-index|limit=${PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE}`,
    () => $fetch<PublicPlaceIndexPage>(
      `/api/places?limit=${PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE}`
    )
  )
  const collection = computed<Place[]>(() =>
    (state.data.value?.items ?? []) as Place[]
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const nextCursor = computed(() => state.data.value?.nextCursor ?? '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const count = computed(() => collection.value.length)
  const pending = computed(() => state.pending.value)
  const error = computed<unknown | undefined>(() => state.error.value ?? undefined)
  const { outcome } = useFirestoreCollectionState({ count, error, pending })
  const byId = computed(() => {
    const map = new Map<string, Place>()
    for (const place of collection.value) {
      if (place?.id) map.set(String(place.id), place)
    }
    return map
  })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<PublicPlaceIndexPage>(
        `/api/places?limit=${PUBLIC_PLACE_INDEX_MAX_PAGE_SIZE}&cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const items = new Map<string, PublicPlaceProjection>(
        current.items.map(item => [item.id, item])
      )
      for (const item of page.items) items.set(item.id, item)
      state.data.value = {
        items: [...items.values()],
        ...(page.nextCursor ? { nextCursor: page.nextCursor } : {}),
      }
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
