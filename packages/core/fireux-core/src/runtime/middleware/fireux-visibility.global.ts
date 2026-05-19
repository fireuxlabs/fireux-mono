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
}

export default defineNuxtRouteMiddleware((to) => {
  const meta = to.meta as RouteMetaWithVisibility
  const visibility = normaliseNavVisibility(
    meta.visibility ?? meta.nav?.visibility
  )

  if (!visibility) return
  if (isNavVisibleForScope(visibility, useFireUXConfig())) return

  return navigateTo('/', { replace: true })
})
