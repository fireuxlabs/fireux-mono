// Concurrent edit — 2026-07-20 22:04 CEST — Place-root authority pass: consume the bounded Place-hydrated Kitchen directory projection.
import { useAsyncData } from '#imports'
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model'

export type PublicKitchenIndexOutcome =
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

type UsePublicKitchenIndexOptions = {
  pageSize?: number
}

export function usePublicKitchenIndex(
  options: UsePublicKitchenIndexOptions = {}
) {
  const fireux = useFireUXConfig()
  const pageSize = normalizePageSize(options.pageSize)
  const endpoint = `/api/kitchens?limit=${pageSize}`
  const key = [
    'public-kitchen-index',
    `app=${encodeURIComponent(fireux.appId || 'app')}`,
    `limit=${pageSize}`,
  ].join('|')
  const state = useAsyncData<PublicKitchenIndexPage>(
    key,
    () => $fetch<PublicKitchenIndexPage>(endpoint)
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const kitchens = computed(() => state.data.value?.items ?? [])
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<PublicKitchenIndexOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return kitchens.value.length ? 'ready' : 'empty'
  })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const items = new Map(current.items.map(item => [item.id, item]))
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
    kitchens,
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    ready: state.then(() => undefined),
    outcome,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}

function normalizePageSize(value: unknown) {
  const pageSize = Number(value ?? PUBLIC_KITCHEN_INDEX_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_KITCHEN_INDEX_PAGE_SIZE
}
