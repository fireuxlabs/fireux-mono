import { useAsyncData } from '#imports'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { MenuInterfaceSource } from '../../firestore/menu/utils/view/useMenuInterface'
import {
  menuRoutePath,
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../../utils/kitchen-menu-route'

export type KitchenPublicMenuIndexItem = MenuInterfaceSource & {
  id: string
  name: string
  status: string
}

type UseKitchenPublicMenuIndexOptions = {
  routeScope?: MaybeRefOrGetter<MenuRouteScope>
}

export function useKitchenPublicMenuIndex(
  options: UseKitchenPublicMenuIndexOptions = {}
) {
  const fireux = useFireUXConfig()
  const menuRouteScope = computed(() =>
    options.routeScope ? toValue(options.routeScope) : rootMenuRouteScope()
  )
  const kitchenSlug = computed(() =>
    menuRouteScope.value.kind === 'directory'
      ? String(menuRouteScope.value.kitchenSlug || '').trim()
      : ''
  )
  const endpoint = computed(() => {
    if (menuRouteScope.value.kind === 'directory') {
      if (!kitchenSlug.value) return ''
      const query = new URLSearchParams({ kitchenSlug: kitchenSlug.value })
      return `/api/menus?${query.toString()}`
    }

    return fireux.isTenant ? '/api/menus' : ''
  })
  const key = computed(() =>
    [
      'kitchen-public-menu-index',
      `app=${encodeURIComponent(fireux.appId || 'app')}`,
      `scope=${menuRouteScope.value.kind}`,
      `kitchen=${encodeURIComponent(kitchenSlug.value)}`,
    ].join('|')
  )
  const state = useAsyncData(
    key,
    () =>
      endpoint.value
        ? $fetch<KitchenPublicMenuIndexItem[]>(endpoint.value)
        : Promise.resolve([] as KitchenPublicMenuIndexItem[]),
    { default: () => [], watch: [endpoint] }
  )
  const ready = state.then(() => undefined)

  return {
    menus: computed(() => state.data.value ?? []),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    ready,
    menuRouteScope,
    menuLink: (menuId: string) => menuRoutePath({
      scope: menuRouteScope.value,
      menuId,
    }),
  }
}
