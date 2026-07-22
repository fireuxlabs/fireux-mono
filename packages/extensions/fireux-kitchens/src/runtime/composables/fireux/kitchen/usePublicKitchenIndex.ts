// Concurrent edit — 2026-07-20 22:04 CEST — Place-root authority pass: consume the bounded Place-hydrated Kitchen directory projection.
// Concurrent edit — 2026-07-20 23:52 CEST — Nuxt Package Toolchain Pass 2 of 3: publish a portable Kitchen index declaration.
// Concurrent edit — 2026-07-22 15:12 CEST — Kitchen directory preview: upgrade authorized App admins and the local developer to the private projection.
import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model'

export type PublicKitchenIndexOutcome =
  | 'pending'
  | 'error'
  | 'empty'
  | 'ready'

type UsePublicKitchenIndexOptions = {
  pageSize?: number
}

type PublicKitchenIndexControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UsePublicKitchenIndexReturn = PublicKitchenIndexControls & {
  kitchens: ComputedRef<PublicKitchenIndexItem[]>
  privilegedPreview: ComputedRef<boolean>
  ready: Promise<void>
  outcome: ComputedRef<PublicKitchenIndexOutcome>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
}

export function usePublicKitchenIndex(
  options: UsePublicKitchenIndexOptions = {}
): UsePublicKitchenIndexReturn {
  const fireux = useFireUXConfig()
  const { currentUser, hasAuthState } = useAuth()
  const { isAdmin, isDeveloper } = useUser()
  const uid = computed(() => String(currentUser.value?.uid ?? '').trim())
  const canPreviewAll = computed(() =>
    Boolean(uid.value) && (isAdmin.value || (import.meta.dev && isDeveloper.value))
  )
  const pageSize = normalizePageSize(options.pageSize)
  const endpoint = `/api/kitchens?limit=${pageSize}`
  const key = [
    'public-kitchen-index',
    `app=${encodeURIComponent(fireux.appId || 'app')}`,
    `limit=${pageSize}`,
  ].join('|')
  const state = useAsyncData<PublicKitchenIndexPage>(
    key,
    () => $fetch<PublicKitchenIndexPage>(endpoint)
  )
  const previewState = useAsyncData<{
    requestUid: string
    page: PublicKitchenIndexPage
  } | null>(
    () => `private-kitchen-index-${fireux.appId}-${uid.value || 'signed-out'}-${pageSize}`,
    async () => {
      const user = currentUser.value
      const requestUid = uid.value
      if (
        !import.meta.client ||
        !hasAuthState.value ||
        !canPreviewAll.value ||
        !user ||
        user.uid !== requestUid
      ) {
        return null
      }

      const token = await user.getIdToken()
      const page = await $fetch<PublicKitchenIndexPage>(
        `${endpoint}&visibility=all`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return { requestUid, page }
    },
    {
      server: false,
      lazy: true,
      dedupe: 'defer',
      watch: [hasAuthState, canPreviewAll, uid],
    }
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const previewPage = computed(() => {
    const value = previewState.data.value
    return value?.requestUid === uid.value ? value.page : null
  })
  const privilegedPreview = computed(() => Boolean(previewPage.value))
  const page = computed(() => previewPage.value || state.data.value)
  const kitchens = computed(() => page.value?.items ?? [])
  const nextCursor = computed(() => page.value?.nextCursor || '')
  const hasMore = computed(() => Boolean(nextCursor.value))
  const outcome = computed<PublicKitchenIndexOutcome>(() => {
    if (
      state.pending.value ||
      (canPreviewAll.value && previewState.pending.value)
    ) return 'pending'
    if (
      state.error.value ||
      !state.data.value ||
      (canPreviewAll.value && previewState.error.value)
    ) return 'error'
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

      const items = new Map(current.items.map(item => [item.id, item]))
      for (const item of nextPage.items) items.set(item.id, item)
      const merged = {
        items: [...items.values()],
        ...(nextPage.nextCursor ? { nextCursor: nextPage.nextCursor } : {}),
      }
      if (preview && previewState.data.value) {
        previewState.data.value = {
          requestUid: uid.value,
          page: merged,
        }
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

  return {
    kitchens,
    privilegedPreview,
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    ready: state.then(() => undefined),
    outcome,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  }
}

function normalizePageSize(value: unknown) {
  const pageSize = Number(value ?? PUBLIC_KITCHEN_INDEX_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_KITCHEN_INDEX_PAGE_SIZE
}
