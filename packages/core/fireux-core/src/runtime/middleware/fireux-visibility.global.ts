import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useFireUXConfig } from '../app/composables/config/FireUXConfig'
import {
  isNavVisibleForScope,
  normaliseNavVisibility,
} from '../composables/navigation/visibility'
import type { NavMeta, NavVisibility } from '../composables/navigation/types'
import type { FireuxAppRole } from '../../config/app/types'

type RouteMetaWithVisibility = {
  nav?: NavMeta
  visibility?: NavVisibility
  appRole?: FireuxAppRole
}

export default defineNuxtRouteMiddleware((to) => {
  const meta = to.meta as RouteMetaWithVisibility
  const fireux = useFireUXConfig()

  if (meta.appRole === 'global' && !fireux.isGlobal) {
    return navigateTo('/', { replace: true })
  }
  if (meta.appRole === 'tenant' && !fireux.isTenant) {
    return navigateTo('/', { replace: true })
  }
  if (meta.appRole === 'standalone' && !fireux.isStandalone) {
    return navigateTo('/', { replace: true })
  }

  const visibility = normaliseNavVisibility(
    meta.visibility ?? meta.nav?.visibility
  )

  if (!visibility) return
  if (isNavVisibleForScope(visibility, fireux)) return

  return navigateTo('/', { replace: true })
})
