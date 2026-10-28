import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  parseMenuRouteTarget,
  rootMenuRouteScope,
  tenantMenuRouteScope,
} from '../utils/menu-route'

export function useMenuExit() {
  const fireux = useFireUXConfig()
  const route: RouteLocationNormalizedLoadedGeneric = useRoute()
  const kitchenSlug = computed(() => {
    const value = route.params.slug

    return String(Array.isArray(value) ? value[0] : value || '').trim()
  })
  const kitchenCollectionRecoverySlug = computed(() => {
    if (route.params.menuId) return ''

    const suffix = '.collection'

    return kitchenSlug.value.endsWith(suffix)
      ? kitchenSlug.value.slice(0, -suffix.length)
      : ''
  })
  const routeScope = computed(() => {
    const directorySlug =
      kitchenCollectionRecoverySlug.value || kitchenSlug.value
    if (directorySlug) return directoryMenuRouteScope(directorySlug)

    return fireux.isTenant ? tenantMenuRouteScope() : rootMenuRouteScope()
  })
  const isKioskMenu = computed(
    () => parseMenuRouteTarget(route.params.menuId).context === 'kiosk'
  )
  const exitPath = computed(() => {
    if (kitchenCollectionRecoverySlug.value) {
      return `/kitchens/${encodeURIComponent(kitchenCollectionRecoverySlug.value)}`
    }

    return fireux.isTenant ? '/' : menuRouteIndexPath(routeScope.value)
  })
  const exitKind = computed(() =>
    fireux.isTenant && !kitchenCollectionRecoverySlug.value ? 'close' : 'back'
  )
  const exitLabel = computed(() => {
    if (kitchenCollectionRecoverySlug.value) return 'Back to kitchen'

    return fireux.isTenant ? 'Close menu' : 'Back to menus'
  })

  return {
    exitKind,
    exitLabel,
    exitPath,
    isKioskMenu,
    routeScope,
  }
}
