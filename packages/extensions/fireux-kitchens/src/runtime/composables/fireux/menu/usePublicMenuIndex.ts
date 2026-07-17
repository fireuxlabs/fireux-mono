import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  PUBLIC_MENU_INDEX_MAX_PAGE_SIZE,
  PUBLIC_MENU_INDEX_PAGE_SIZE,
  type PublicMenuIndexPage,
} from '../../../models/kitchen/menu/menu-index.model'
import {
  menuRoutePath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'

export type PublicMenuIndexOutcome =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'empty' }
  | { kind: 'redirect', path: string }
  | { kind: 'list' }

type UsePublicMenuIndexOptions = {
  routeScope?: MaybeRefOrGetter<MenuRouteScope>
  pageSize?: number
}

export function usePublicMenuIndex(options: UsePublicMenuIndexOptions = {}) {
  const fireux = useFireUXConfig()
  const routeScope = computed(() =>
    options.routeScope ? toValue(options.routeScope) : rootMenuRouteScope()
  )
  const kitchenSlug = computed(() =>
    routeScope.value.kind === 'directory'
      ? String(routeScope.value.kitchenSlug || '').trim()
      : ''
  )
  const pageSize = normalizePageSize(options.pageSize)
  const baseEndpoint = computed(() => {
    const query = new URLSearchParams({ limit: String(pageSize) })
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)

    return `/api/menus?${query.toString()}`
  })
  const key = computed(() =>
    [
      'public-menu-index',
      `app=${encodeURIComponent(fireux.appId || 'app')}`,
      `scope=${routeScope.value.kind}`,
      `kitchen=${encodeURIComponent(kitchenSlug.value)}`,
      `limit=${pageSize}`,
    ].join('|')
  )
  const state = useAsyncData<PublicMenuIndexPage>(
    key,
    () => $fetch<PublicMenuIndexPage>(baseEndpoint.value),
    { watch: [baseEndpoint] }
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const ready = state.then(() => undefined)
  const menus = computed(() => state.data.value?.items ?? [])
  const nextCursor = computed(() => state.data.value?.nextCursor ?? null)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const redirectSingleTenant = computed(() =>
    fireux.isTenant && routeScope.value.kind === 'root'
  )
  const outcome = computed<PublicMenuIndexOutcome>(() => {
    if (state.pending.value) return { kind: 'loading' }
    if (state.error.value || !state.data.value) return { kind: 'unavailable' }
    if (!menus.value.length) return { kind: 'empty' }

    if (
      redirectSingleTenant.value &&
      menus.value.length === 1 &&
      !hasMore.value
    ) {
      return {
        kind: 'redirect',
        path: menuLink(menus.value[0]?.id || ''),
      }
    }

    return { kind: 'list' }
  })
  const statusCode = computed(() => requestStatusCode(state.error.value))

  function menuLink(menuId: string) {
    return menuRoutePath({
      scope: routeScope.value,
      menuId,
    })
  }

  async function loadMore() {
    const cursor = nextCursor.value
    if (!cursor || loadingMore.value) return false

    loadingMore.value = true
    loadMoreError.value = null
    try {
      const separator = baseEndpoint.value.includes('?') ? '&' : '?'
      const page = await $fetch<PublicMenuIndexPage>(
        `${baseEndpoint.value}${separator}cursor=${encodeURIComponent(cursor)}`
      )
      const current = state.data.value
      if (!current) return false

      const items = new Map(current.items.map(item => [item.id, item]))
      for (const item of page.items) items.set(item.id, item)

      state.data.value = {
        ...page,
        items: [...items.values()],
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
    menus,
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    ready,
    routeScope,
    outcome,
    statusCode,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
    menuLink,
  }
}

export type PublicMenuIndexController = ReturnType<typeof usePublicMenuIndex>

function normalizePageSize(value: unknown) {
  const pageSize = Number(value ?? PUBLIC_MENU_INDEX_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, PUBLIC_MENU_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_MENU_INDEX_PAGE_SIZE
}

function requestStatusCode(value: unknown) {
  if (!value) return null

  const error = value as {
    status?: number
    statusCode?: number
    data?: { status?: number, statusCode?: number }
  }
  const statusCode = Number(
    error.statusCode ||
    error.status ||
    error.data?.statusCode ||
    error.data?.status ||
    500
  )

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500
}
