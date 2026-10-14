import {
  abortNavigation,
  createError,
  defineNuxtRouteMiddleware,
  navigateTo,
  useRouter,
} from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  menuRouteQrPath,
  parseMenuRouteTarget,
  tenantMenuRouteScope,
} from '../menu/utils/menu-route'

export default defineNuxtRouteMiddleware((to) => {
  const fireux = useFireUXConfig()
  if (!fireux.isTenant) return

  const router = useRouter()
  const target = parseMenuRouteTarget(to.params.menuId)
  const scope = tenantMenuRouteScope()
  const genericPath = menuRoutePath({
    scope,
    menuId: target.menuId,
  })
  const resolvesToMenu = router
    .resolve(genericPath)
    .matched.some((record) => record.meta.menuProjection === true)

  if (!genericPath || !resolvesToMenu) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: 'Menu not found.',
      })
    )
  }

  if (!to.path.startsWith('/menus/')) return

  const path = to.path.endsWith('/qr')
    ? menuRouteQrPath({
        scope,
        menuId: target.menuId,
        context: target.context,
      })
    : menuRoutePath({
        scope,
        menuId: target.menuId,
        context: target.context,
      })

  return navigateTo(
    { path, query: to.query, hash: to.hash },
    {
      redirectCode: 302,
      replace: true,
    }
  )
})
