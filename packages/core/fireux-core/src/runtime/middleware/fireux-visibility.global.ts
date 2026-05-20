import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'
import {
  isNavVisibleForScope,
  normaliseNavVisibility,
} from '../composables/fireux/app/ui/nav/visibility'
import type { NavMeta, NavVisibility } from '../composables/fireux/app/nav.types'

type RouteMetaWithVisibility = {
  nav?: NavMeta
  visibility?: NavVisibility
  tenant?: string
}

export default defineNuxtRouteMiddleware((to) => {
  const meta = to.meta as RouteMetaWithVisibility
  const fireux = useFireUXConfig()

  if (meta.tenant === 'global' && !fireux.isGlobal) {
    return navigateTo('/', { replace: true })
  }
  if (meta.tenant === 'tenant' && !fireux.isTenant) {
    return navigateTo('/', { replace: true })
  }
  if (meta.tenant === 'standalone' && !fireux.isStandalone) {
    return navigateTo('/', { replace: true })
  }

  const visibility = normaliseNavVisibility(
    meta.visibility ?? meta.nav?.visibility
  )

  if (!visibility) return
  if (isNavVisibleForScope(visibility, fireux)) return

  return navigateTo('/', { replace: true })
})
