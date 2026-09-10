import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import type { App } from '../models/app.model'
import type { CollectionPage } from '../../models/utils/directory'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

type Options = { authenticated?: boolean }

/** Shared App transport state. The caller supplies the directory or relationship URL. */
export function useAppCollection(endpoint: MaybeRefOrGetter<string>, options: Options = {}) {
  const { currentUser, hasAuthState } = useAuth()
  const url = computed(() => toValue(endpoint))
  const key = computed(() => `apps:${url.value}:${options.authenticated ? currentUser.value?.uid || '' : 'public'}`)
  const active = computed(() => Boolean(url.value && (!options.authenticated || currentUser.value)))
  async function fetchPage(target: string): Promise<CollectionPage<App>> {
    const headers = options.authenticated
      ? { authorization: `Bearer ${await currentUser.value!.getIdToken()}` }
      : undefined
    const response = await $fetch<CollectionPage<App>>(target, { headers })
    if (response?.ok !== true || !Array.isArray(response.items) ||
      (response.nextCursor != null && typeof response.nextCursor !== 'string')) {
      throw new Error('The App collection response is invalid.')
    }
    return { ...response, nextCursor: response.nextCursor ?? null }
  }
  const state = useAsyncData(key, async () => {
    const requestKey = key.value
    const page = active.value ? await fetchPage(url.value) : { ok: true as const, items: [], nextCursor: null }
    return { ...page, requestKey }
  }, { server: !options.authenticated })
  const current = computed(() => state.data.value?.requestKey === key.value ? state.data.value : undefined)
  const apps = computed(() => active.value ? current.value?.items ?? [] : [])
  const count = computed(() => apps.value.length)
  const pending = computed(() => Boolean(options.authenticated && !hasAuthState.value) || (active.value && state.pending.value))
  const error = state.error
  const outcome = computed(() => {
    if (pending.value) return 'pending' as const
    if (!active.value) return 'idle' as const
    if (error.value) return 'error' as const
    return count.value ? 'ready' as const : 'empty' as const
  })
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const hasMore = computed(() => Boolean(current.value?.nextCursor))
  let generation = 0
  watch(key, () => { generation++; loadingMore.value = false; loadMoreError.value = null }, { flush: 'sync' })
  async function loadMore() {
    const cursor = current.value?.nextCursor
    if (!cursor || loadingMore.value) return
    const requestKey = key.value
    const requestGeneration = generation
    loadingMore.value = true
    loadMoreError.value = null
    try {
      const separator = url.value.includes('?') ? '&' : '?'
      const page = await fetchPage(`${url.value}${separator}cursor=${encodeURIComponent(cursor)}`)
      if (key.value !== requestKey || generation !== requestGeneration || !current.value) return
      const items = new Map(current.value.items.map(app => [app.id, app]))
      for (const app of page.items) items.set(app.id, app)
      state.data.value = { ...page, items: [...items.values()], requestKey }
    } catch (cause) {
      if (key.value === requestKey && generation === requestGeneration) loadMoreError.value = cause
    } finally {
      if (generation === requestGeneration) loadingMore.value = false
    }
  }
  async function refresh() {
    generation++
    loadingMore.value = false
    loadMoreError.value = null
    await state.refresh()
  }
  return { apps, count, pending, error, outcome, refresh, hasMore, loadingMore, loadMoreError, loadMore }
}
