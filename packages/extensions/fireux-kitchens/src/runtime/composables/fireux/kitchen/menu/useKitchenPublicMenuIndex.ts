import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { MenuInterfaceSource } from '../../firestore/menu/utils/view/useMenuInterface'
import {
  menuRoutePath,
  rootMenuRouteScope,
} from '../../../../utils/kitchen-menu-route'

export type KitchenPublicMenuIndexItem = MenuInterfaceSource & {
  id: string
  name: string
  status: string
}

export function useKitchenPublicMenuIndex() {
  const fireux = useFireUXConfig()
  const menuRouteScope = rootMenuRouteScope()
  const state = useAsyncData(
    `kitchen-public-menu-index-${fireux.appId || 'app'}`,
    () =>
      fireux.isTenant
        ? $fetch<KitchenPublicMenuIndexItem[]>('/api/menus')
        : Promise.resolve([] as KitchenPublicMenuIndexItem[]),
    { default: () => [] }
  )

  return {
    menus: computed(() => state.data.value ?? []),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    menuRouteScope,
    menuLink: (menuId: string) => menuRoutePath({
      scope: menuRouteScope,
      menuId,
    }),
  }
}
