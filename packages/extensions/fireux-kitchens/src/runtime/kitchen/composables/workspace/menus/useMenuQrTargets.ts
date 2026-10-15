import { computed } from 'vue'
import { useKitchenWorkspaceMenus } from './useKitchenWorkspaceMenus'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  menuRouteProjection,
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../../menu/utils/menu-route'
import { menuWebsiteOrigin } from '../../../utils/menu-website-snippet'
import type { KitchenMenu as Menu } from '../../../../menu/models/kitchen-menu-storage.model.ts'
import type { MenuRouteContext } from '../../../../menu/models/menu-context.model.ts'
import { kitchenOrderTypeLabel } from '../../../utils/kitchen-order-label'
import { publicMenuSurfaceProfiles } from '../../../../menu/utils/menu-context'
import type {
  MenuQrPanel,
  MenuQrTarget,
} from '../../../models/menu-qr-presentation.model'

export function useMenuQrTargets() {
  const {
    selectedKitchen,
    menus,
    menuSources,
    offerings,
    offeringsOutcome,
    outcome: menusOutcome,
  } = useKitchenWorkspaceMenus()

  const clean = (value: unknown) => String(value ?? '').trim()
  const fireux = useFireUXConfig()
  const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
  const menuUrlResolver = {
    menuPath: (
      slug: string,
      context: MenuRouteContext = 'generic',
      offeringId?: string
    ) =>
      menuRoutePath({
        scope: fireux.isTenant
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(selectedKitchen.value?.slug),
        menuId: slug,
        context,
        offeringId,
      }),
    menuUrl: (
      slug: string,
      context: MenuRouteContext = 'generic',
      offeringId?: string
    ) => {
      const path = menuUrlResolver.menuPath(slug, context, offeringId)
      return path && origin ? new URL(path, origin).href : ''
    },
  }
  const menuPanels = computed(() => buildMenuPanels(menus.value))
  const draftSource = computed(
    () =>
      menuSources.value.find((source) => clean(source.status) === 'draft') ??
      null
  )

  function buildMenuPanels(sourceMenus: Menu[]): MenuQrPanel[] {
    return sourceMenus
      .map((menu) => {
        const menuId = clean(menu.id)
        if (!menuId) return null

        const menuName = clean(menu.name) || menuId
        const targets =
          menu.status === 'published' ? buildQrTargets(menu, menuId) : []

        return {
          id: menuId,
          label: menuName,
          description: clean(menu.description),
          status: menu.status,
          summary:
            menu.status === 'published'
              ? describeMenuPanel(targets)
              : 'Publish this menu before creating guest entries.',
          editPath: `/workspace/kitchen/menus/${encodeURIComponent(menu.slug)}`,
          targets,
        }
      })
      .filter((panel): panel is MenuQrPanel => Boolean(panel))
  }

  function buildQrTargets(menu: Menu, menuId: string): MenuQrTarget[] {
    const targets: MenuQrTarget[] = []

    addTarget(targets, {
      id: `${menuId}:default`,
      label: 'Default',
      description: 'No funnel or specific entry point.',
      path: menuUrlResolver.menuPath(menu.slug),
      url: menuUrlResolver.menuUrl(menu.slug),
    })

    for (const service of offerings.value) {
      if (!service.enabled || !service.menu_ids.includes(menu.id)) continue
      if (
        service.interactions.some((row) => row.type === 'browse' && row.enabled)
      ) {
        addMenuContextTarget(targets, {
          menuId,
          menuSlug: menu.slug,
          offeringId: service.id,
          context: 'generic',
          label: service.name + ' · Browse',
          description: 'View this service’s Menu.',
        })
      }
      if (
        menu.doc?.url.trim() ||
        !service.hours?.timezone ||
        !service.hours.windows.length
      )
        continue
      const enabledTypes = service.interactions
        .filter(
          (row) =>
            row.type !== 'browse' && row.enabled && !row.availability?.paused
        )
        .map((row) => row.type)
      for (const surface of publicMenuSurfaceProfiles) {
        if (menuRouteProjection(surface.context) === 'diagnostic') continue
        const surfaceTypes = surface.visibleOrderTypes.filter((type) =>
          enabledTypes.includes(type)
        )
        if (!surfaceTypes.length) continue
        addMenuContextTarget(targets, {
          menuId,
          menuSlug: menu.slug,
          offeringId: service.id,
          context: surface.context,
          label: service.name + ' · ' + surface.label,
          description: surfaceTypes.map(kitchenOrderTypeLabel).join(', '),
        })
      }
    }

    return targets
  }

  function describeMenuPanel(targets: MenuQrTarget[]) {
    const entries = targets
      .filter((target) => !target.id.endsWith(':default'))
      .map((target) => target.label)

    return entries.length
      ? `Default plus ${entries.join(', ')}.`
      : 'Default only.'
  }

  function addMenuContextTarget(
    targets: MenuQrTarget[],
    options: {
      menuId: string
      menuSlug: string
      offeringId: string
      context: MenuRouteContext
      label: string
      description: string
    }
  ) {
    addTarget(targets, {
      id: `${options.menuId}:${options.offeringId}:${options.context}`,
      label: options.label,
      description: options.description,
      path: menuUrlResolver.menuPath(
        options.menuSlug,
        options.context,
        options.offeringId
      ),
      url: menuUrlResolver.menuUrl(
        options.menuSlug,
        options.context,
        options.offeringId
      ),
    })
  }

  function addTarget(targets: MenuQrTarget[], target: MenuQrTarget) {
    if (!target.path || !target.url) return
    if (targets.some((existing) => existing.id === target.id)) return

    targets.push(target)
  }
  return { menusOutcome, offeringsOutcome, menuPanels, draftSource }
}
