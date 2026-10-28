import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { defineNuxtRouteMiddleware } from '#imports'
import {
  menuRouteProjection,
  parseMenuRouteTarget,
} from '../menu/utils/menu-route'

export default defineNuxtRouteMiddleware(
  (to: RouteLocationNormalizedGeneric) => {
    const rawMenuId = Array.isArray(to.params.menuId)
      ? String(to.params.menuId[0] || '').trim()
      : String(to.params.menuId || '').trim()
    if (!rawMenuId) {
      const rawKitchenSlug = Array.isArray(to.params.slug)
        ? String(to.params.slug[0] || '').trim()
        : String(to.params.slug || '').trim()

      if (rawKitchenSlug.endsWith('.collection')) {
        to.meta.layout = 'menu'
      }
      return
    }

    const target = parseMenuRouteTarget(to.params.menuId)
    const projection = menuRouteProjection(target.context)

    to.meta.layout = projection === 'diagnostic' ? 'default' : 'menu'
  }
)
