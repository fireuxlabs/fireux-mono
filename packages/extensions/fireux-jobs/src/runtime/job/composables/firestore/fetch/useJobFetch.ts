// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: keep Job fetches domain-neutral and unhydrated.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: reserve raw exact reads for authenticated authoring surfaces.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: exact-load through the author-only server route.
import {
  computed,
  isRef,
  onScopeDispose,
  ref,
  watch,
  type Ref,
} from 'vue'
import { fetchAuthorJob } from '../../author/jobAuthorClient'
import type { Job } from '../../../models/job.model.ts'

export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const jobId = computed(() => (isRef(id) ? id.value : id) ?? null)
  const job = ref<Job | null>(null)
  const pending = ref(true)
  const error = ref<unknown>(null)
  let requestVersion = 0

  const refresh = async () => {
    const version = ++requestVersion
    const currentId = String(jobId.value ?? '').trim()
    if (!currentId) {
      job.value = null
      pending.value = false
      error.value = null
      return
    }

    pending.value = true
    error.value = null
    try {
      const response = await fetchAuthorJob(currentId)
      if (version === requestVersion) job.value = response.job
    } catch (cause) {
      if (version === requestVersion) {
        job.value = null
        error.value = cause
      }
    } finally {
      if (version === requestVersion) pending.value = false
    }
  }

  const stop = import.meta.client
    ? watch(jobId, () => void refresh(), { immediate: true })
    : () => {}
  onScopeDispose(stop)

  const outcome = computed(() =>
    pending.value ? 'pending'
      : error.value ? 'error'
        : job.value ? 'ready'
          : 'missing'
  )

  return { job, pending, error, outcome, refresh }
}

export type JobFetchRefs = ReturnType<typeof useJobFetch>
