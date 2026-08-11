import { useAsyncData } from '#imports'
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
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
  canViewHidden: ComputedRef<boolean>
  ready: Promise<void>
  outcome: ComputedRef<'pending' | 'error' | 'empty' | 'ready'>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

/** Canonical Kitchen collection with an authorized hidden-root enhancement. */
export function useKitchenCollection(): UseKitchenCollectionReturn {
  const { currentUser, hasAuthState } = useAuth()
  const uid = computed(() => String(currentUser.value?.uid || '').trim())
  const endpoint = `/api/kitchens?limit=${PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE}`
  const state = useAsyncData<PublicKitchenIndexPage>(
    `kitchen-collection|limit=${PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE}`,
    () => $fetch<PublicKitchenIndexPage>(endpoint)
  )
  const hiddenPage = ref<PublicKitchenIndexPage | null>(null)
  let hiddenGeneration = 0

  async function requestHidden() {
    const generation = ++hiddenGeneration
    const user = currentUser.value
    const requestUid = uid.value
    hiddenPage.value = null
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      user.uid !== requestUid
    ) return

    try {
      const token = await user.getIdToken()
      const page = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&includeHidden=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (generation === hiddenGeneration && uid.value === requestUid) {
        hiddenPage.value = page
      }
    } catch {
      // Ordinary signed-in users keep the standard collection outcome.
    }
  }

  if (import.meta.client) {
    watch(
      [hasAuthState, uid],
      () => { void requestHidden() },
      { immediate: true, flush: 'post' }
    )
  }

  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const canViewHidden = computed(() => Boolean(hiddenPage.value))
  const activePage = computed(() => hiddenPage.value || state.data.value)
  const kitchens = computed<PublicKitchenIndexItem[]>(
    () => activePage.value?.items ?? []
  )
  const count = computed(() => kitchens.value.length)
  const nextCursor = computed(() => activePage.value?.nextCursor || '')
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
      const includeHidden = canViewHidden.value && Boolean(user)
      const token = includeHidden ? await user!.getIdToken() : ''
      const nextPage = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&cursor=${encodeURIComponent(cursor)}${includeHidden ? '&includeHidden=true' : ''}`,
        includeHidden
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      )
      const current = activePage.value
      if (!current) return false
      const items = new Map(
        current.items.map((item: PublicKitchenIndexItem) => [item.id, item])
      )
      for (const item of nextPage.items) items.set(item.id, item)
      const merged = {
        items: [...items.values()],
        ...(nextPage.nextCursor ? { nextCursor: nextPage.nextCursor } : {}),
      }
      if (includeHidden) hiddenPage.value = merged
      else state.data.value = merged
      return true
    } catch (error) {
      loadMoreError.value = error
      return false
    } finally {
      loadingMore.value = false
    }
  }

  return {
    kitchens,
    count,
    canViewHidden,
    pending: computed(() => state.pending.value),
    error: computed<unknown>(() => state.error.value),
    refresh: async () => {
      await state.refresh()
      void requestHidden()
    },
    ready: state.then(() => undefined),
    outcome,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}
