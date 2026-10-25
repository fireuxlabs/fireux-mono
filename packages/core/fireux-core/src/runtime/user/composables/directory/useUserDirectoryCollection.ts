import { computed, ref } from 'vue'
import { useLiveAsyncData } from '../../../composables/fireux/firestore/useLiveAsyncData'
import { readLivePages } from '../../../composables/fireux/firestore/readLivePages'
import { resolveReadOutcome } from '../../../utils/read-outcome'
import type { CollectionPage } from '../../../models/utils/directory'
import type { User } from '../../models/user.model'

/** The server owns current-App directory eligibility; every loaded page stays live. */
export function useUserDirectoryCollection(appId: string) {
  const pageCount = ref(1)
  const loadingMore = ref(false)
  const state = useLiveAsyncData<CollectionPage<User>>(
    `user-directory:${appId}`,
    (fetch) => readLivePages(fetch, '/api/users?limit=25', pageCount.value)
  )
  const users = computed(() =>
    state.error.value ? [] : (state.data.value?.items ?? [])
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled: Boolean(appId),
      pending: state.pending.value,
      failed: Boolean(state.error.value),
      present: users.value.length > 0,
    })
  )
  const hasMore = computed(
    () => !state.error.value && Boolean(state.data.value?.nextCursor)
  )

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || state.pending.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      if (state.error.value) pageCount.value--
    } finally {
      loadingMore.value = false
    }
  }

  return {
    users,
    outcome,
    hasMore,
    loadMore,
    pending: state.pending,
    error: state.error,
  }
}
