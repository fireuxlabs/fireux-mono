// Concurrent edit — 2026-07-21 13:09 CEST — Public Jobs projection: keep pagination callbacks explicitly typed for Nuxt consumers.
// Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: distinguish exhausted emptiness from a scan page with more results.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: key public collections by all-versus-allowlist authority.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useFireuxJobsConfig } from '../../../composables/config/useFireuxJobsConfig'
import {
  PUBLIC_JOB_INDEX_MAX_PAGE_SIZE,
  PUBLIC_JOB_INDEX_PAGE_SIZE,
  type PublicJobIndexPage,
  type PublicJobProjection,
} from '../../models/job-public.model.ts'

export type PublicJobIndexOutcome = 'pending' | 'error' | 'empty' | 'ready'

type PublicJobCollectionControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicJobCollectionReturn = PublicJobCollectionControls & {
  jobs: ComputedRef<PublicJobProjection[]>
  count: ComputedRef<number>
  ready: Promise<void>
  outcome: ComputedRef<PublicJobIndexOutcome>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function usePublicJobCollection(
  options: { pageSize?: number } = {}
): UsePublicJobCollectionReturn {
  const fireux = useFireUXConfig()
  const jobsConfig = useFireuxJobsConfig()
  const pageSize = normalizePageSize(options.pageSize)
  const endpoint = `/api/public/jobs?limit=${pageSize}`
  const key = [
    'public-job-index',
    `app=${encodeURIComponent(fireux.appId || 'app')}`,
    `categories=${encodeURIComponent(
      jobsConfig.categoryScope === 'all'
        ? 'all'
        : jobsConfig.categories.join(',')
    )}`,
    `limit=${pageSize}`,
  ].join('|')
  const state = useAsyncData<PublicJobIndexPage>(
    key,
    () => $fetch<PublicJobIndexPage>(endpoint)
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const jobs = computed(() => state.data.value?.items ?? [])
  const count = computed(() => jobs.value.length)
  const nextCursor = computed(() => state.data.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<PublicJobIndexOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return jobs.value.length || nextCursor.value ? 'ready' : 'empty'
  })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const page = await $fetch<PublicJobIndexPage>(
        `${endpoint}&cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const currentItems: PublicJobProjection[] = current.items
      const items = new Map<string, PublicJobProjection>(
        currentItems.map(
          (item: PublicJobProjection): [string, PublicJobProjection] => [
            item.id,
            item,
          ]
        )
      )
      for (const item of page.items as PublicJobProjection[]) {
        items.set(item.id, item)
      }
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
    jobs,
    count,
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
  const pageSize = Number(value ?? PUBLIC_JOB_INDEX_PAGE_SIZE)
  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PUBLIC_JOB_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_JOB_INDEX_PAGE_SIZE
}
