// Concurrent edit — 2026-07-24 18:12 CEST — Kitchen collection canon: own only the bounded directory projection.
import { useAsyncData } from '#imports'
import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../../../../models/kitchen/kitchen-index.model'

type KitchenCollectionControls = {
  pending: ComputedRef<boolean>
  error: ComputedRef<unknown>
  refresh: () => Promise<void>
}

export type UseKitchenCollectionReturn = KitchenCollectionControls & {
  kitchens: ComputedRef<PublicKitchenIndexItem[]>
  count: ComputedRef<number>
  privilegedPreview: ComputedRef<boolean>
  ready: Promise<void>
  outcome: ComputedRef<'pending' | 'error' | 'empty' | 'ready'>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

const normalize = (value: unknown) => String(value ?? '').trim()

/**
 * Canonical Kitchen directory collection.
 *
 * Like Place and Company collections, this composable consumes the bounded
 * server projection. Signed-in users may receive the private projection when
 * the server confirms current-App admin or local developer authority.
 */
export function useKitchenCollection(): UseKitchenCollectionReturn {
  const fireux = useFireUXConfig()
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => normalize(currentUser.value?.uid))
  const endpoint = `/api/kitchens?limit=${PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE}`
  const state = useAsyncData<PublicKitchenIndexPage>(
    [
      'kitchen-collection',
      `app=${encodeURIComponent(fireux.appId || 'app')}`,
      `limit=${PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE}`,
    ].join('|'),
    () => $fetch<PublicKitchenIndexPage>(endpoint)
  )
  const previewPage = ref<PublicKitchenIndexPage | null>(null)
  let previewGeneration = 0

  async function requestPreview() {
    const generation = ++previewGeneration
    const user = currentUser.value
    const requestUid = uid.value
    previewPage.value = null

    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      user.uid !== requestUid
    ) {
      return
    }

    try {
      const token = await user.getIdToken()
      const page = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&visibility=all`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (generation === previewGeneration && uid.value === requestUid) {
        previewPage.value = page
      }
    } catch {
      // The authorized preview is progressive enhancement. Public Kitchens
      // remain usable when auth refresh or the private projection is unavailable.
    }
  }

  if (import.meta.client) {
    watch(
      [hasAuthState, uid],
      () => {
        void requestPreview()
      },
      { immediate: true, flush: 'post' }
    )
  }
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const privilegedPreview = computed(() =>
    import.meta.dev || Boolean(previewPage.value)
  )
  const page = computed(() => previewPage.value || state.data.value)
  const kitchens = computed<PublicKitchenIndexItem[]>(
    () => page.value?.items ?? []
  )
  const count = computed(() => kitchens.value.length)
  const nextCursor = computed(() => page.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<'pending' | 'error' | 'empty' | 'ready'>(() => {
    if (state.pending.value) return 'pending'
    if (state.error.value || !state.data.value) return 'error'
    return kitchens.value.length ? 'ready' : 'empty'
  })

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const user = currentUser.value
      const preview = privilegedPreview.value && user
      const token = preview ? await user.getIdToken() : ''
      const nextPage = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&cursor=${encodeURIComponent(cursor)}${preview ? '&visibility=all' : ''}`,
        preview ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      const current = page.value
      if (!current) return false

      const items = new Map(
        current.items.map((item: PublicKitchenIndexItem) => [item.id, item])
      )
      for (const item of nextPage.items) items.set(item.id, item)
      const merged = {
        items: [...items.values()],
        ...(nextPage.nextCursor ? { nextCursor: nextPage.nextCursor } : {}),
      }
      if (preview) {
        previewPage.value = merged
      } else {
        state.data.value = merged
      }
      return true
    } catch (error) {
      loadMoreError.value = error
      return false
    } finally {
      loadingMore.value = false
    }
  }

  const pending = computed(() => state.pending.value)
  const error = computed<unknown>(() => state.error.value)
  const refresh = async () => {
    await state.refresh()
    void requestPreview()
  }

  return {
    kitchens,
    count,
    privilegedPreview,
    pending,
    error,
    refresh,
    ready: state.then(() => undefined),
    outcome,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}
