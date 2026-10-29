import { useAsyncData } from 'nuxt/app'
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

import { readPages } from '../../composables/http/readPages'
import { resolveReadOutcome } from '../../utils/read-outcome'
import type { CollectionPage } from '../../models/utils/directory'
import type { User } from '../models/user.model'

/** Public User pages use the existing server projection and native Nuxt refresh. */
export function useUserCollection() {
  const { appId } = useFireUXConfig()
  const pageCount = ref(1)
  const loadingMore = ref(false)
  const state = useAsyncData<CollectionPage<User>>(
    `user-directory:${appId}`,
    async (_nuxtApp, { signal }) => {
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      return readPages(fetchRead, '/api/users?limit=25', pageCount.value)
    }
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
    count: computed(() => users.value.length),
    outcome,
    hasMore,
    loadMore,
    pending: state.pending,
    error: state.error,
  }
}
