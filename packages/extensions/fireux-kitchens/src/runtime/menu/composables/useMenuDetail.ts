import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../../kitchen/utils/kitchen-menu-route'
import { useMenu } from './useMenu'

export function useMenuDetail(routeMenuId: MaybeRefOrGetter<string>) {
  const fireux = useFireUXConfig()
  const target = computed(() => parseMenuRouteTarget(toValue(routeMenuId)))
  const routeScope = computed(() =>
    fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope()
  )
  const state = useMenu(
    computed(() => target.value.menuId),
    {
      routeScope,
      menuContext: computed(() => target.value.context),
    }
  )

  return {
    menu: state.menu,
    ready: state.ready,
  }
}
