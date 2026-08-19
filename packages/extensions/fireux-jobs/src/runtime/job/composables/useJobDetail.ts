// Concurrent edit — 2026-07-21 12:53 CEST — Job detail: resolve the exact canonical Job during SSR.
// Concurrent edit — 2026-07-22 12:56 CEST — Job category scope: key public details by all-versus-allowlist authority.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Company } from 'fireux-companies/runtime/place/models/company.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { useFireuxJobsConfig } from '../../composables/config/useFireuxJobsConfig'
import type {
  JobApplicationDoorway,
  JobDetailResponse,
} from '../models/job-directory.model.ts'
import type { Job } from '../models/job.model.ts'

export type JobDetailOutcome = 'pending' | 'ready' | 'missing' | 'error'

type JobDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseJobDetailReturn = JobDetailControls & {
  job: ComputedRef<Job | null>
  company: ComputedRef<Company | null>
  companyPlace: ComputedRef<Place | null>
  place: ComputedRef<Place | null>
  applicationDoorway: ComputedRef<JobApplicationDoorway | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  missing: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<JobDetailOutcome>
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

export function useJobDetail(
  jobId: MaybeRef<string | null | undefined>
): UseJobDetailReturn {
  const fireux = useFireUXConfig()
  const jobsConfig = useFireuxJobsConfig()
  const id = computed(() => String(unref(jobId) ?? '').trim())
  const state = useAsyncData<JobDetailResponse | null>(
    () =>
      [
        'job-detail',
        fireux.appId,
        jobsConfig.categoryScope === 'all'
          ? 'all'
          : jobsConfig.categories.join(','),
        id.value || 'none',
      ].join('|'),
    async () => {
      if (!id.value) return null
      return $fetch<JobDetailResponse>(
        `/api/jobs/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const response = computed<JobDetailResponse | null>(() => {
    const value = state.data.value
    return value?.job.id === id.value && !state.pending.value ? value : null
  })
  const job = computed(() => response.value?.job ?? null)
  const company = computed(() => response.value?.company ?? null)
  const companyPlace = computed(() => response.value?.companyPlace ?? null)
  const place = computed(() => response.value?.place ?? null)
  const applicationDoorway = computed(
    () => response.value?.applicationDoorway ?? null
  )
  const statusCode = computed(() => readStatusCode(state.error.value))
  const missing = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !job.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<JobDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (missing.value) return 'missing'
    return 'ready'
  })

  return {
    job,
    company,
    companyPlace,
    place,
    applicationDoorway,
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
