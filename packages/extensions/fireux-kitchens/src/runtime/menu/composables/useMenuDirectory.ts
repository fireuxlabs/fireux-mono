import {
  useFirestoreCollectionState,
  type FirestoreCollectionOutcome,
} from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCollection'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  computed,
  watch,
  ref,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { RouteRecordNormalized } from 'vue-router'
import { useRouter } from '#imports'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { readLivePages } from 'fireux-core/runtime/composables/fireux/firestore/readLivePages'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  MENU_DIRECTORY_MAX_PAGE_SIZE,
  MENU_DIRECTORY_PAGE_SIZE,
  type MenuDirectoryEntry,
  type MenuDirectoryPage,
} from '../models/menu-directory.response.ts'
import {
  menuRoutePath,
  rootMenuRouteScope,
  tenantMenuRouteScope,
  type MenuRouteScope,
} from '../../kitchen/utils/kitchen-menu-route'

export type MenuDirectoryOutcome =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'empty' }
  | { kind: 'redirect'; path: string }
  | { kind: 'list' }

type UseMenuDirectoryOptions = {
  routeScope?: MaybeRefOrGetter<MenuRouteScope>
  pageSize?: number
}

type MenuCollectionControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'refresh'
>

export type UseMenuDirectoryReturn = MenuCollectionControls & {
  collection: ComputedRef<MenuDirectoryEntry[]>
  error: ComputedRef<Error | NuxtError<unknown> | null>
  ready: Promise<void>
  routeScope: ComputedRef<MenuRouteScope>
  outcome: ComputedRef<FirestoreCollectionOutcome>
  count: ComputedRef<number>
  directoryOutcome: ComputedRef<MenuDirectoryOutcome>
  statusCode: ComputedRef<number | null>
  hasMore: ComputedRef<boolean>
  loadingMore: Ref<boolean>
  loadMoreError: Ref<unknown>
  loadMore: () => Promise<boolean>
  menuLink: (menuId: string) => string
}

export function useMenuDirectory(
  options: UseMenuDirectoryOptions = {}
): UseMenuDirectoryReturn {
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
      'menu-collection',
      `app=${encodeURIComponent(fireux.appId || 'app')}`,
      `scope=${routeScope.value.kind}`,
      `kitchen=${encodeURIComponent(kitchenSlug.value)}`,
      `limit=${pageSize}`,
    ].join('|')
  )
  const pageCount = ref(1)
  watch(
    baseEndpoint,
    () => {
      pageCount.value = 1
    },
    { flush: 'sync' }
  )
  const state = useLiveAsyncData<MenuDirectoryPage>(
    key,
    (liveFetch) =>
      readLivePages<MenuDirectoryPage>(
        liveFetch,
        baseEndpoint.value,
        pageCount.value
      ),
    { watch: [baseEndpoint] }
  )
  const loadingMore = ref(false)
  const loadMoreError = ref<unknown>(null)
  const ready = state.then(() => undefined)
  const collection = computed<MenuDirectoryEntry[]>(
    () => state.data.value?.items ?? []
  )
  const nextCursor = computed(() => state.data.value?.nextCursor ?? null)
  const hasMore = computed(() => Boolean(nextCursor.value))
  const tenantRouteCollisions = computed<MenuDirectoryEntry[]>(() =>
    routeScope.value.kind === 'tenant'
      ? collection.value.filter(
          (menu: MenuDirectoryEntry) =>
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
            .map((menu: MenuDirectoryEntry) => menu.id)
            .join(', ')}`
        )
      : null
  )
  const error = computed(() => state.error.value || routePolicyError.value)
  const redirectSingleTenant = computed(
    () => routeScope.value.kind === 'tenant'
  )
  const directoryOutcome = computed<MenuDirectoryOutcome>(() => {
    if (state.pending.value) return { kind: 'loading' }
    if (error.value || !state.data.value) return { kind: 'unavailable' }
    if (!collection.value.length) return { kind: 'empty' }

    if (
      redirectSingleTenant.value &&
      collection.value.length === 1 &&
      !hasMore.value
    ) {
      return {
        kind: 'redirect',
        path: menuLink(collection.value[0]?.id || ''),
      }
    }

    return { kind: 'list' }
  })
  const count = computed(() => collection.value.length)
  const { outcome } = useFirestoreCollectionState({
    count,
    pending: state.pending,
    error,
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
    if (!hasMore.value || loadingMore.value) return false
    loadingMore.value = true
    loadMoreError.value = null
    pageCount.value++
    try {
      await state.refresh()
      if (state.error.value) throw state.error.value
      return true
    } catch (error) {
      loadMoreError.value = error
      return false
    } finally {
      loadingMore.value = false
    }
  }

  return {
    collection,
    pending: state.pending,
    error,
    refresh: state.refresh,
    ready,
    routeScope,
    outcome,
    count,
    directoryOutcome,
    statusCode,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
    menuLink,
  }
}

export type MenuDirectoryController = UseMenuDirectoryReturn

function normalizePageSize(value: unknown) {
  const pageSize = Number(value ?? MENU_DIRECTORY_PAGE_SIZE)

  return Number.isInteger(pageSize) && pageSize > 0
    ? Math.min(pageSize, MENU_DIRECTORY_MAX_PAGE_SIZE)
    : MENU_DIRECTORY_PAGE_SIZE
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
