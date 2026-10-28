import { useAsyncData } from 'nuxt/app'
import { readPages } from 'fireux-core/runtime/composables/http/readPages'

import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  PROPERTY_DIRECTORY_MAX_PAGE_SIZE,
  PROPERTY_DIRECTORY_PAGE_SIZE,
  type PropertyDirectoryEntry,
  type PropertyDirectoryPage,
} from '../models/property-index.model.ts'

export type PropertyDirectoryOutcome = 'pending' | 'error' | 'empty' | 'ready'

type UsePropertyDirectoryOptions = {
  pageSize?: number
}

type PropertyDirectoryControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePropertyDirectoryReturn = PropertyDirectoryControls & {
  properties: ComputedRef<PropertyDirectoryEntry[]>
  ready: Promise<void>
  outcome: ComputedRef<PropertyDirectoryOutcome>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function usePropertyDirectory(
  options: UsePropertyDirectoryOptions = {}
): UsePropertyDirectoryReturn {
  const fireux = useFireUXConfig()
  const pageSize = normalizePageSize(options.pageSize)
  const endpoint = `/api/properties?limit=${pageSize}`
  const key = [
    'property-collection',
    `app=${encodeURIComponent(fireux.appId || 'app')}`,
    `limit=${pageSize}`,
  ].join('|')
  const pageCount = ref(1)
  const state = useAsyncData<PropertyDirectoryPage>(
    key,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages<PropertyDirectoryPage>(
        fetchRead,
        endpoint,
        pageCount.value
      )
    }
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const properties = computed(() => state.data.value?.items ?? [])
  // Only the failed next-page request may retain the current records.
  const pending = computed(
    () =>
      state.pending.value && !(loadingMore.value && properties.value.length > 0)
  )
  const error = computed(() =>
    properties.value.length > 0 &&
    (loadingMore.value ||
      (loadMoreError.value && state.error.value === loadMoreError.value))
      ? undefined
      : (state.error.value ?? undefined)
  )
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<PropertyDirectoryOutcome>(() => {
    if (error.value) return 'error'
    if (pending.value) return 'pending'
    if (!state.data.value) return 'error'
    return properties.value.length ? 'ready' : 'empty'
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
      pageCount.value--
      return false
    } finally {
      loadingMore.value = false
    }
  }

  return {
    properties,
    pending,
    error,
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
  const pageSize = Number(value ?? PROPERTY_DIRECTORY_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PROPERTY_DIRECTORY_MAX_PAGE_SIZE)
    : PROPERTY_DIRECTORY_PAGE_SIZE
}
