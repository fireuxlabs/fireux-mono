import { defineNuxtRouteMiddleware } from '#imports'
import {
  menuRouteProjection,
  parseMenuRouteTarget,
} from '../utils/kitchen-menu-route'

export default defineNuxtRouteMiddleware((to) => {
  const target = parseMenuRouteTarget(to.params.menuId)
  const projection = menuRouteProjection(target.context)

  to.meta.layout = projection === 'diagnostic' ? 'default' : 'menu'
})
