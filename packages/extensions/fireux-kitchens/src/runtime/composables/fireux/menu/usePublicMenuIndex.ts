// Concurrent edit — 2026-07-20 23:52 CEST — Nuxt Package Toolchain Pass 2 of 3: publish a portable Menu index declaration.
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  computed,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { RouteRecordNormalized } from 'vue-router'
import { useAsyncData, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import {
  PUBLIC_MENU_INDEX_MAX_PAGE_SIZE,
  PUBLIC_MENU_INDEX_PAGE_SIZE,
  type PublicMenuIndexItem,
  type PublicMenuIndexPage,
} from '../../../models/kitchen/menu/menu-index.model'
import {
  menuRoutePath,
  rootMenuRouteScope,
  tenantMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'

export type PublicMenuIndexOutcome =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'empty' }
  | { kind: 'redirect'; path: string }
  | { kind: 'list' }

type UsePublicMenuIndexOptions = {
  routeScope?: MaybeRefOrGetter<MenuRouteScope>
  pageSize?: number
}

type PublicMenuIndexControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'refresh'
>

export type UsePublicMenuIndexReturn = PublicMenuIndexControls & {
  menus: ComputedRef<PublicMenuIndexItem[]>
  error: ComputedRef<Error | NuxtError<unknown> | null>
  ready: Promise<void>
  routeScope: ComputedRef<MenuRouteScope>
  outcome: ComputedRef<PublicMenuIndexOutcome>
  statusCode: ComputedRef<number | null>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
  menuLink: (menuId: string) => string
}

export function usePublicMenuIndex(
  options: UsePublicMenuIndexOptions = {}
): UsePublicMenuIndexReturn {
  const fireux = useFireUXConfig()
  const router = useRouter()
  const routeScope = computed(() =>
    options.routeScope
      ? toValue(options.routeScope)
      : fireux.isTenant
        ? tenantMenuRouteScope()
        : rootMenuRouteScope()
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
  const menus = computed<PublicMenuIndexItem[]>(
    () => state.data.value?.items ?? []
  )
  const nextCursor = computed(() => state.data.value?.nextCursor ?? null)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const tenantRouteCollisions = computed<PublicMenuIndexItem[]>(() =>
    routeScope.value.kind === 'tenant'
      ? menus.value.filter(
          (menu: PublicMenuIndexItem) =>
            !router
              .resolve(menuLink(menu.id))
              .matched.some(
                (record: RouteRecordNormalized) =>
                  record.meta.menuProjection === true
              )
        )
      : []
  )
  const routePolicyError = computed<Error | null>(() =>
    tenantRouteCollisions.value.length
      ? new Error(
          `Tenant Menu ids collide with existing root routes: ${tenantRouteCollisions.value
            .map((menu: PublicMenuIndexItem) => menu.id)
            .join(', ')}`
        )
      : null
  )
  const error = computed(() => state.error.value || routePolicyError.value)
  const redirectSingleTenant = computed(
    () => routeScope.value.kind === 'tenant'
  )
  const outcome = computed<PublicMenuIndexOutcome>(() => {
    if (state.pending.value) return { kind: 'loading' }
    if (error.value || !state.data.value) return { kind: 'unavailable' }
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
  const statusCode = computed(() =>
    routePolicyError.value ? 500 : requestStatusCode(state.error.value)
  )

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

      const items = new Map<string, PublicMenuIndexItem>(
        current.items.map((item: PublicMenuIndexItem) => [item.id, item])
      )
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
    error,
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

export type PublicMenuIndexController = UsePublicMenuIndexReturn

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
    data?: { status?: number; statusCode?: number }
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
