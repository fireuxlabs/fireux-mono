import { useAsyncData } from 'nuxt/app'
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

import { fetchAuthorJobs } from './author/jobAuthorClient'
export function useJobCollection() {
  const { currentUser } = useAuth()
  const state = useAsyncData(
    computed(() => `author-jobs:${currentUser.value?.uid || ''}`),
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return fetchAuthorJobs(fetchRead)
    },
    { server: false }
  )
  const jobs = computed(() => state.data.value?.items || [])
  return {
    jobs,
    count: computed(() => jobs.value.length),
    pending: state.pending,
    error: state.error,
    truncated: computed(() => state.data.value?.truncated || false),
    refresh: state.refresh,
    outcome: computed(() =>
      state.pending.value
        ? 'pending'
        : state.error.value
          ? 'error'
          : jobs.value.length
            ? 'ready'
            : 'empty'
    ),
  }
}
