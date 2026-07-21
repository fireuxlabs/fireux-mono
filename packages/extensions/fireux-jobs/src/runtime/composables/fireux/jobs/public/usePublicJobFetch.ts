// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: resolve exact public Job detail during SSR.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFireuxJobsConfig } from '../../../config/useFireuxJobsConfig'
import type {
  PublicJobDetailResponse,
  PublicJobProjection,
} from '../../../../models/job-public.model'

export type PublicJobDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type PublicJobDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicJobFetchReturn = PublicJobDetailControls & {
  job: ComputedRef<PublicJobProjection | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<PublicJobDetailOutcome>
}

function readStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

export function usePublicJobFetch(
  jobId: MaybeRef<string | null | undefined>
): UsePublicJobFetchReturn {
  const fireux = useFireUXConfig()
  const jobsConfig = useFireuxJobsConfig()
  const id = computed(() => String(unref(jobId) ?? '').trim())
  const state = useAsyncData<PublicJobDetailResponse | null>(
    () => [
      'public-job-detail',
      fireux.appId,
      jobsConfig.categories.join(','),
      id.value || 'none',
    ].join('|'),
    async () => {
      if (!id.value) return null
      return $fetch<PublicJobDetailResponse>(
        `/api/public/jobs/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const job = computed<PublicJobProjection | null>(() => {
    const item = state.data.value?.item
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !job.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<PublicJobDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    job,
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
