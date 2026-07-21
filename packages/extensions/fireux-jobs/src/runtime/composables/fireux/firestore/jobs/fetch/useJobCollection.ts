// Concurrent edit — 2026-07-21 12:25 CEST — Neutral Jobs migration seam: remove product-named Job collection aliases.
// Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: reserve this raw collection read for authenticated authoring and dev surfaces.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: replace raw root collection reads with the bounded current-author endpoint.
import { computed, onMounted, ref } from 'vue'
import { fetchAuthorJobs } from '../../../jobs/author/jobAuthorClient'
import type { Job } from '../../../../../models/job.model'

export function useJobCollection() {
  const jobs = ref<Job[]>([])
  const pending = ref(true)
  const error = ref<unknown>(null)
  const truncated = ref(false)

  const refresh = async () => {
    pending.value = true
    error.value = null
    try {
      const response = await fetchAuthorJobs()
      jobs.value = response.items
      truncated.value = response.truncated
    } catch (cause) {
      jobs.value = []
      truncated.value = false
      error.value = cause
    } finally {
      pending.value = false
    }
  }

  onMounted(() => void refresh())

  const resolvedJobs = computed(() => jobs.value)
  const appJobs = computed(() => jobs.value)
  const count = computed(() => jobs.value.length)
  const outcome = computed(() =>
    pending.value ? 'pending'
      : error.value ? 'error'
        : jobs.value.length ? 'ready'
          : 'empty'
  )

  return {
    jobs: resolvedJobs,
    appJobs,
    count,
    pending,
    error,
    outcome,
    truncated,
    refresh,
  }
}
