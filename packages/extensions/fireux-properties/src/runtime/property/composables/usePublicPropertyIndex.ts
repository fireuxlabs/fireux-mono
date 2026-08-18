// Concurrent edit — 2026-07-20 22:40 CEST — Property public projection: consume the bounded server DTO instead of raw Property roots.
// Concurrent edit — 2026-07-20 23:42 CEST — Nuxt Package Toolchain Pass 2 of 3: publish portable public index declarations.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  PUBLIC_PROPERTY_INDEX_MAX_PAGE_SIZE,
  PUBLIC_PROPERTY_INDEX_PAGE_SIZE,
  type PublicPropertyIndexItem,
  type PublicPropertyIndexPage,
} from '../models/property-index.model.ts'

export type PublicPropertyIndexOutcome =
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

type UsePublicPropertyIndexOptions = {
  pageSize?: number
}

type PublicPropertyIndexControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicPropertyIndexReturn = PublicPropertyIndexControls & {
  properties: ComputedRef<PublicPropertyIndexItem[]>
  ready: Promise<void>
  outcome: ComputedRef<PublicPropertyIndexOutcome>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function usePublicPropertyIndex(
  options: UsePublicPropertyIndexOptions = {}
): UsePublicPropertyIndexReturn {
  const fireux = useFireUXConfig()
  const pageSize = normalizePageSize(options.pageSize)
  const endpoint = `/api/properties?limit=${pageSize}`
  const key = [
    'public-property-index',
    `app=${encodeURIComponent(fireux.appId || 'app')}`,
    `limit=${pageSize}`,
  ].join('|')
  const state = useAsyncData<PublicPropertyIndexPage>(
    key,
    () => $fetch<PublicPropertyIndexPage>(endpoint)
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const properties = computed(() => state.data.value?.items ?? [])
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<PublicPropertyIndexOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return properties.value.length ? 'ready' : 'empty'
  })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<PublicPropertyIndexPage>(
        `${endpoint}&cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const items = new Map(
        current.items.map((item: PublicPropertyIndexItem) => [item.id, item])
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
    properties,
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
  const pageSize = Number(value ?? PUBLIC_PROPERTY_INDEX_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PUBLIC_PROPERTY_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_PROPERTY_INDEX_PAGE_SIZE
}
