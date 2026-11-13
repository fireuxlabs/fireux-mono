import { useAsyncData, type AsyncData } from 'nuxt/app'
import { resolveReadOutcome } from '../../utils/read-outcome'
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

import { readPages } from '../../composables/http/readPages'
import type { App } from '../models/model'
import type { CollectionPage } from '../../types/directory'
import { useAuth } from '../../composables/fireux/firebase/useAuth'

type Options = { authenticated?: boolean }
type AppWindow = CollectionPage<App> & {
  requestKey: string
  pages: number
}

/** Native acquisition owns the loaded window; appends request only its next cursor. */
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
  const retained = ref<AppWindow>()
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const requestKind = ref<'window' | 'append'>('window')
  let scopeVersion = 0
  let appendIntent: { base: AppWindow } | undefined

  // Reset before Nuxt's reactive-key watcher starts the new scope's acquisition.
  watch(
    key,
    () => {
      scopeVersion++
      pageCount.value = 1
      retained.value = undefined
      appendIntent = undefined
      loadingMore.value = false
      loadMoreError.value = null
      requestKind.value = 'window'
    },
    { flush: 'sync' }
  )

  const state = useAsyncData<AppWindow>(
    key,
    async (_nuxtApp, { signal }) => {
      const append = appendIntent
      appendIntent = undefined
      requestKind.value = append ? 'append' : 'window'
      if (!append) loadMoreError.value = null
      const requestKey = key.value
      const requestVersion = scopeVersion
      const requestUrl = url.value
      const requestedPages = pageCount.value
      const actor = currentUser.value
      const fetchRead = $fetch.create({ signal, cache: 'no-store' })
      const headers =
        options.authenticated && actor
          ? { authorization: `Bearer ${await actor.getIdToken()}` }
          : undefined
      const assertCurrent = () => {
        if (
          signal.aborted ||
          requestVersion !== scopeVersion ||
          requestKey !== key.value
        )
          throw new Error('The App collection scope changed.')
      }
      assertCurrent()
      if (!active.value)
        return {
          ok: true as const,
          items: [],
          nextCursor: null,
          requestKey,
          pages: 1,
        }

      if (append) {
        const page = await fetchRead<CollectionPage<App>>(requestUrl, {
          query: { cursor: append.base.nextCursor },
          headers,
        })
        assertCurrent()
        const items = new Map(append.base.items.map((app) => [app.id, app]))
        for (const app of page.items) items.set(app.id, app)
        return {
          ...page,
          items: [...items.values()],
          requestKey,
          pages: append.base.pages + 1,
        }
      }
      const page = await readPages<CollectionPage<App>>(
        fetchRead,
        requestUrl,
        requestedPages,
        { headers }
      )
      assertCurrent()
      return { ...page, requestKey, pages: requestedPages }
    },
    { server: !options.authenticated }
  )
  watch(
    state.data,
    (value) => {
      if (value?.requestKey === key.value) {
        retained.value = value
        pageCount.value = value.pages
      }
    },
    { immediate: true, flush: 'sync' }
  )
  const current = computed(() => {
    if (state.data.value?.requestKey === key.value) return state.data.value
    // Nuxt clears data on failure. Only a failed append retains its proved window.
    return requestKind.value === 'append' &&
      retained.value?.requestKey === key.value
      ? retained.value
      : undefined
  })
  const apps = computed<App[]>(() =>
    active.value ? (current.value?.items ?? []) : []
  )
  const count = computed(() => apps.value.length)
  const pending = computed(
    () =>
      Boolean(options.authenticated && !hasAuthState.value) ||
      (active.value &&
        state.pending.value &&
        !(requestKind.value === 'append' && loadingMore.value && current.value))
  )
  const error = computed(() =>
    count.value > 0 &&
    requestKind.value === 'append' &&
    (loadingMore.value ||
      (loadMoreError.value && state.error.value === loadMoreError.value))
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

  async function loadMore() {
    if (
      !hasMore.value ||
      loadingMore.value ||
      state.pending.value ||
      !current.value
    )
      return
    const requestVersion = scopeVersion
    const intent = { base: current.value }
    appendIntent = intent
    loadingMore.value = true
    try {
      await state.refresh()
      if (scopeVersion === requestVersion && requestKind.value === 'append')
        loadMoreError.value = state.error.value
    } catch (cause) {
      if (scopeVersion === requestVersion && requestKind.value === 'append')
        loadMoreError.value = cause
    } finally {
      if (scopeVersion === requestVersion) {
        if (appendIntent === intent) appendIntent = undefined
        loadingMore.value = false
      }
    }
  }
  return {
    apps,
    count,
    pending,
    error,
    outcome,
    refresh: state.refresh as AsyncData<unknown, unknown>['refresh'],
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}

export type AppCollectionController = ReturnType<typeof useAppCollection>
