// Concurrent edit — 2026-07-20 16:21 CEST — Repo Efficiency Pass 1 of 6: resolve ecosystem App routing through the DTO boundary and fail closed across ecosystems.
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppDetail } from 'fireux-core/runtime/app/composables/useAppDetail'
import type { MenuRouteContext } from '../../../menu/models/menu-context.model.ts'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
  tenantMenuRouteScope,
  type MenuRouteScope,
} from '../../utils/kitchen-menu-route'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

export function useKitchenMenuUrl(options: {
  appId: MaybeRef<string | null | undefined>
  kitchenSlug: MaybeRef<string | null | undefined>
}) {
  const fireux = useFireUXConfig()
  const appId = computed(() => text(unref(options.appId)))
  const kitchenSlug = computed(() => text(unref(options.kitchenSlug)))
  const { app, pending } = useAppDetail(appId)
  const isCurrentApp = computed(() => appId.value === fireux.appId)
  const appRecord = computed<Record<string, unknown>>(() =>
    app.value && typeof app.value === 'object'
      ? app.value as Record<string, unknown>
      : {}
  )
  const appRole = computed(() =>
    appId.value === fireux.appId ? fireux.role : appRecord.value.role
  )
  // This adapter may choose the app's default doorway. Storage ownership does not.
  const routeScope = computed<MenuRouteScope>(() =>
    text(appRole.value).toLowerCase() === 'tenant'
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(kitchenSlug.value)
  )
  const menuIndexPath = computed(() =>
    menuRouteIndexPath(routeScope.value)
  )
  const socialLinks = computed<Record<string, unknown>>(() => {
    const links = appRecord.value.social_links
    return links && typeof links === 'object' && !Array.isArray(links)
      ? links as Record<string, unknown>
      : {}
  })
  const appOrigin = computed(() => {
    const projectedOrigin = origin(socialLinks.value.website)
    if (projectedOrigin) return projectedOrigin
    if (!isCurrentApp.value) return ''
    return (
      origin(fireux.siteUrl) ||
      (import.meta.client ? origin(window.location.origin) : '')
    )
  })
  const menuIndexUrl = computed(() => {
    if (!menuIndexPath.value) return ''
    if (!appOrigin.value) {
      return isCurrentApp.value ? menuIndexPath.value : ''
    }
    return new URL(menuIndexPath.value, appOrigin.value).toString()
  })
  const menuPath = (
    menuId: unknown,
    context: MenuRouteContext = 'generic'
  ) =>
    menuRoutePath({
      scope: routeScope.value,
      menuId,
      context,
    })
  const menuUrl = (
    menuId: unknown,
    context: MenuRouteContext = 'generic'
  ) => {
    const path = menuPath(menuId, context)
    if (!path) return ''
    if (!appOrigin.value) return isCurrentApp.value ? path : ''
    return new URL(path, appOrigin.value).toString()
  }
  const debug = computed(() => ({
    appId: appId.value,
    kitchenSlug: kitchenSlug.value,
    appRole: text(appRole.value),
    routeScope: routeScope.value,
    menuIndexPath: menuIndexPath.value,
    menuIndexUrl: menuIndexUrl.value,
    appOrigin: appOrigin.value,
    pending: pending.value,
  }))

  return {
    appId,
    kitchenSlug,
    routeScope,
    menuIndexPath,
    menuIndexUrl,
    menuPath,
    menuUrl,
    pending,
    debug,
  }
}
