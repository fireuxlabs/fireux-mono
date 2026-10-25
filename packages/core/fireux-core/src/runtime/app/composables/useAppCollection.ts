import { resolveReadOutcome } from '../../utils/read-outcome'
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
  const url = computed(() => String(toValue(endpoint) || '').trim())
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
      const requestUrl = url.value
      const requestedPages = pageCount.value
      const headers =
        options.authenticated && currentUser.value
          ? { authorization: `Bearer ${await currentUser.value.getIdToken()}` }
          : undefined
      const page = active.value
        ? await readLivePages<CollectionPage<App>>(
            liveFetch,
            requestUrl,
            requestedPages,
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
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const pending = computed(
    () =>
      Boolean(options.authenticated && !hasAuthState.value) ||
      (active.value &&
        state.pending.value &&
        !(loadingMore.value && current.value))
  )
  const error = computed(() =>
    loadingMore.value ||
    (loadMoreError.value && state.error.value === loadMoreError.value)
      ? null
      : state.error.value
  )
  const outcome = computed(() =>
    resolveReadOutcome({
      enabled:
        Boolean(options.authenticated && !hasAuthState.value) || active.value,
      pending: pending.value,
      failed: Boolean(error.value),
      present: count.value > 0,
    })
  )
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
    const requestKey = key.value
    loadingMore.value = true
    pageCount.value++
    try {
      await state.refresh()
      if (key.value === requestKey) {
        loadMoreError.value = state.error.value
        if (state.error.value) pageCount.value--
      }
    } catch (cause) {
      if (key.value === requestKey) {
        loadMoreError.value = cause
        pageCount.value--
      }
    } finally {
      if (key.value === requestKey) loadingMore.value = false
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

export type AppCollectionController = ReturnType<typeof useAppCollection>
