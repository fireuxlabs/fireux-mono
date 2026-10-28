import type { RouteLocationNormalizedGeneric } from 'vue-router'
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useNuxtApp,
  useRequestEvent,
} from '#imports'
import { parseMenuRouteTarget } from '../menu/utils/menu-route'
import { embeddingNeedsDocumentNavigation } from '../kitchen/utils/embedding-response'

export default defineNuxtRouteMiddleware(
  async (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric
  ) => {
    if (import.meta.client) {
      if (
        embeddingNeedsDocumentNavigation({
          framed: window.self !== window.top,
          hydrating: useNuxtApp().isHydrating === true,
          fromPath: from.path,
          toPath: to.path,
        })
      ) {
        return navigateTo(to.fullPath, { external: true, replace: true })
      }
      return
    }
    if (import.meta.server) {
      const event = useRequestEvent()
      if (!event) return
      const { applyKitchenEmbeddingPolicy } = await import(
        '../kitchen/server/integrations/embedding-policy'
      )
      const rawMenuId = Array.isArray(to.params.menuId)
        ? to.params.menuId[0]
        : to.params.menuId
      const kitchenSlug = Array.isArray(to.params.slug)
        ? to.params.slug[0]
        : to.params.slug
      await applyKitchenEmbeddingPolicy(event, {
        ...(rawMenuId
          ? { menuId: parseMenuRouteTarget(rawMenuId).menuId }
          : {}),
        ...(kitchenSlug ? { kitchenSlug } : {}),
      })
    }
  }
)
