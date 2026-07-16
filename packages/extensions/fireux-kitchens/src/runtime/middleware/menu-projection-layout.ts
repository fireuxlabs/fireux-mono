import { defineNuxtRouteMiddleware } from '#imports'
import { parseMenuRouteTarget } from '../utils/kitchen-menu-route'

export default defineNuxtRouteMiddleware((to) => {
  const target = parseMenuRouteTarget(to.params.menuId)
  to.meta.layout = target.context === 'generic' ? 'menu' : 'default'
})
