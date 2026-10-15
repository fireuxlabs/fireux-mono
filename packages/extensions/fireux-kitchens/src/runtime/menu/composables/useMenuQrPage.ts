import { setResponseStatus, useRequestURL, useSeoMeta } from '#imports'
import { computed, ref } from 'vue'
import { useMenu, type MenuLoadFailure } from './useMenu'
import type { MenuRouteContext } from '../models/menu-context.model.ts'
import type { MenuRouteScope } from '../utils/menu-route'
import { menuManifestSupportsContext } from '../utils/menu-context'

export type MenuQrPageInput = {
  menuId: string
  menuContext?: MenuRouteContext
  menuRouteScope: MenuRouteScope
}
export function useMenuQrPage(props: MenuQrPageInput) {
  const requestUrl = useRequestURL()
  const menuId = computed(() => String(props.menuId || '').trim())
  const menuContext = computed(() => props.menuContext ?? 'generic')
  const menuRouteScope = computed(() => props.menuRouteScope)
  const {
    kitchenSlug,
    indexPath,
    menuPath,
    renderKind,
    document: documentMenu,
    manifest: manifestMenu,
    failure,
    pending,
    ready,
  } = useMenu(menuId, {
    routeScope: menuRouteScope,
    menuContext,
  })
  const menuIndexPath = computed(() => indexPath.value || '/menus')
  const menuUrl = computed(() =>
    menuPath.value ? new URL(menuPath.value, requestUrl.origin).toString() : ''
  )

  const menuName = computed(
    () => manifestMenu.value?.content.name || documentMenu.value?.name || 'Menu'
  )
  const kitchenName = computed(
    () =>
      manifestMenu.value?.presentation.kitchenName ||
      documentMenu.value?.kitchenName ||
      ''
  )
  const kitchenLogoImageUrl = computed(() =>
    String(
      manifestMenu.value?.presentation.kitchenLogoImageUrl ||
        (documentMenu.value as Record<string, unknown> | null)
          ?.kitchenLogoImageUrl ||
        (documentMenu.value as Record<string, unknown> | null)
          ?.logo_image_url ||
        ''
    ).trim()
  )
  const contextAvailable = computed(() => {
    if (renderKind.value === 'document') return menuContext.value === 'generic'
    if (renderKind.value !== 'structured') return false

    return menuManifestSupportsContext(
      manifestMenu.value?.behaviour,
      menuContext.value
    )
  })
  const qrFailure = computed<MenuLoadFailure | null>(() => {
    if (failure.value || pending.value) return failure.value
    if (contextAvailable.value) return null

    return {
      statusCode: 404,
      title: 'Menu not found',
      description:
        'This menu is not available for the requested entry context.',
    }
  })
  const hasMenu = computed(
    () => renderKind.value !== 'unavailable' && !qrFailure.value
  )

  const qrError = ref(false)
  function applyResponseStatus() {
    if (import.meta.server && qrFailure.value)
      setResponseStatus(qrFailure.value.statusCode)
  }
  const qrState = computed(() => {
    if (pending.value) return 'loading'
    if (qrFailure.value) return 'unavailable'
    return qrError.value ? 'error' : 'ready'
  })
  const headingId = computed(() => {
    if (pending.value) return 'menu-qr-loading-title'
    return qrFailure.value ? 'menu-qr-failure-title' : 'menu-qr-title'
  })

  useSeoMeta({
    title: computed(() =>
      qrFailure.value ? qrFailure.value.title : `${menuName.value} QR`
    ),
    description: computed(
      () => qrFailure.value?.description || `Printable QR for ${menuName.value}`
    ),
    robots: 'noindex, nofollow',
  })
  return {
    ready,
    applyResponseStatus,
    pending,
    qrFailure,
    qrError,
    qrState,
    headingId,
    hasMenu,
    menuId,
    menuContext,
    menuRouteScope,
    renderKind,
    menuPath,
    menuIndexPath,
    menuUrl,
    menuName,
    kitchenName,
    kitchenLogoImageUrl,
    kitchenSlug,
  }
}
