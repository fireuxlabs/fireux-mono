import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { fetchAuthorJobs } from './author/jobAuthorClient'
export function useJobCollection() {
  const { currentUser } = useAuth()
  const state = useLiveAsyncData(
    computed(() => `author-jobs:${currentUser.value?.uid || ''}`),
    (liveFetch) => fetchAuthorJobs(liveFetch),
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
