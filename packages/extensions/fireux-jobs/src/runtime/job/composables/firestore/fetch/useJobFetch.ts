import { useAsyncData } from 'nuxt/app'
import { computed, isRef, type Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import { fetchAuthorJob } from '../../author/jobAuthorClient'
export function useJobFetch(
  id: string | null | undefined | Ref<string | null | undefined>
) {
  const { currentUser } = useAuth()
  const jobId = computed(() => (isRef(id) ? id.value : id) || '')
  const state = useAsyncData(
    computed(() => `author-job:${currentUser.value?.uid || ''}:${jobId.value}`),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return jobId.value
        ? fetchAuthorJob(jobId.value, fetchRead)
        : Promise.resolve(null)
    },
    { server: false }
  )
  const job = computed(() => state.data.value?.job || null)
  return {
    job,
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    outcome: computed(() =>
      state.pending.value
        ? 'pending'
        : state.error.value
          ? 'error'
          : job.value
            ? 'ready'
            : 'empty'
    ),
  }
}
export type JobFetchRefs = ReturnType<typeof useJobFetch>
