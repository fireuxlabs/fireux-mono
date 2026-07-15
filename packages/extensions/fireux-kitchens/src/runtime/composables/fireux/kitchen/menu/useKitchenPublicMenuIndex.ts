import { useAsyncData } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { MenuInterfaceSource } from '../../firestore/menu/utils/view/useMenuInterface'
import { kitchenMenuPath } from '../../../../utils/kitchen-menu-route'

export type KitchenPublicMenuIndexItem = MenuInterfaceSource & {
  id: string
  name: string
  status: string
}

export function useKitchenPublicMenuIndex() {
  const fireux = useFireUXConfig()
  const menuRouteMode = 'single-kitchen-app' as const
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
    menuRouteMode,
    menuLink: (menuId: string) => kitchenMenuPath({
      mode: menuRouteMode,
      kitchenSlug: '',
      menuId,
    }),
  }
}
