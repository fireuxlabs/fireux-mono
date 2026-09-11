import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useLiveAsyncData } from '../../composables/fireux/firestore/useLiveAsyncData'
import { readLivePages } from '../../composables/fireux/firestore/readLivePages'
import type { App } from '../models/app.model'
import type { CollectionPage } from '../../models/utils/directory'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

type Options = { authenticated?: boolean }

/** Shared App transport state. The caller supplies the directory or relationship URL. */
export function useAppCollection(
  endpoint: MaybeRefOrGetter<string>,
  options: Options = {}
) {
  const { currentUser, hasAuthState } = useAuth()
  const url = computed(() => toValue(endpoint))
  const key = computed(
    () =>
      `apps:${url.value}:${options.authenticated ? currentUser.value?.uid || '' : 'public'}`
  )
  const active = computed(() =>
    Boolean(url.value && (!options.authenticated || currentUser.value))
  )
  const pageCount = ref(1)
  const state = useLiveAsyncData<CollectionPage<App> & { requestKey: string }>(
    key,
    async (liveFetch) => {
      const requestKey = key.value
      const headers =
        options.authenticated && currentUser.value
          ? { authorization: `Bearer ${await currentUser.value.getIdToken()}` }
          : undefined
      const page = active.value
        ? await readLivePages<CollectionPage<App>>(
            liveFetch,
            url.value,
            pageCount.value,
            { headers }
          )
        : { ok: true as const, items: [], nextCursor: null }
      return { ...page, requestKey }
    },
    { server: !options.authenticated }
  )
  const current = computed<
    (CollectionPage<App> & { requestKey: string }) | undefined
  >(() =>
    state.data.value?.requestKey === key.value ? state.data.value : undefined
  )
  const apps = computed<App[]>(() =>
    active.value ? (current.value?.items ?? []) : []
  )
  const count = computed(() => apps.value.length)
  const pending = computed(
    () =>
      Boolean(options.authenticated && !hasAuthState.value) ||
      (active.value && state.pending.value)
  )
  const error = state.error
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (!active.value) return 'idle' as const
    if (error.value) return 'error' as const
    return count.value ? ('ready' as const) : ('empty' as const)
  })
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const hasMore = computed(() => Boolean(current.value?.nextCursor))
  watch(
    key,
    () => {
      pageCount.value = 1
      loadingMore.value = false
      loadMoreError.value = null
    },
    { flush: 'sync' }
  )
  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      loadMoreError.value = state.error.value
    } finally {
      loadingMore.value = false
    }
  }
  async function refresh() {
    await state.refresh()
  }
  return {
    apps,
    count,
    pending,
    error,
    outcome,
    refresh,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}
