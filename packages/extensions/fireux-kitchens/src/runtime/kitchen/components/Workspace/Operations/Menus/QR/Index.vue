<template>
  <section class="space-y-4">
    <UAlert
      v-if="!menuPanels.length && draftSource"
      color="warning"
      variant="soft"
      icon="i-lucide-file-check-2"
      title="Menu draft ready"
      description="Confirm the draft to create menu records, then publish before generating guest entry points."
      :actions="[
        {
          label: 'Confirm draft',
          to: `/workspace/kitchen/menus/${encodeURIComponent(draftSource.id)}`,
          icon: 'i-lucide-check-circle-2',
        },
      ]"
    />

    <UAlert
      v-else-if="!menuPanels.length"
      color="neutral"
      variant="soft"
      title="No menus yet"
      description="Create a menu from a source, then publish it before generating guest entry points."
    />

    <template v-else>
      <WorkspaceKitchenOperationsMenusQRMenuPanel
        v-for="panel in menuPanels"
        :key="panel.id"
        :panel="panel"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenus } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenus'
import { useKitchenMenuUrl } from '../../../../../composables/menu/useKitchenMenuUrl'
import type { KitchenOrderType } from '../../../../../utils/order.ts'
import type { KitchenMenu as Menu } from '../../../../../../menu/utils/kitchen-menu.ts'
import type { MenuRouteContext } from '../../../../../../menu/models/menu-context.model.ts'
import { menuOrderTypeLabel } from '../../../../../../menu/utils/menu-ordering-ui'
import { publicMenuSurfaceProfiles } from '../../../../../../menu/utils/menu-context'
import WorkspaceKitchenOperationsMenusQRMenuPanel from './MenuPanel.vue'
import type { MenuQrPanel, MenuQrTarget } from './types'

const { selectedKitchen, menus, menuSources, activeKitchenAppId } =
  useKitchenWorkspaceMenus()

const clean = (value: unknown) => String(value ?? '').trim()
const orderTypes = new Set<KitchenOrderType>([
  'dine_in',
  'eat_in',
  'takeaway',
  'collection',
  'delivery',
  'pre_order',
  'room_service',
])
const kitchen = computed(
  () => selectedKitchen.value as Record<string, unknown> | null
)
const kitchenSlug = computed(() => clean(kitchen.value?.slug))
const menuUrlResolver = useKitchenMenuUrl({
  appId: activeKitchenAppId,
  kitchenSlug,
})
const menuPanels = computed(() => buildMenuPanels(menus.value))
const draftSource = computed(
  () =>
    menuSources.value.find((source) => clean(source.status) === 'draft') ?? null
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
        editPath: `/workspace/kitchen/menus/${encodeURIComponent(menuId)}`,
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
    path: menuUrlResolver.menuPath(menuId),
    url: menuUrlResolver.menuUrl(menuId),
  })

  const enabledTypes = enabledOrderTypes(menu)
  publicMenuSurfaceProfiles.forEach((surface) => {
    const surfaceTypes = surface.visibleOrderTypes.filter((type) =>
      enabledTypes.includes(type)
    )
    if (!surfaceTypes.length) return

    addMenuContextTarget(targets, {
      menuId,
      context: surface.context,
      label: surface.label,
      description: surfaceTypes.map(menuOrderTypeLabel).join(', '),
    })
  })

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

function enabledOrderTypes(menu: Menu): KitchenOrderType[] {
  if (!menu.ordering?.enabled) return []

  return (menu.ordering.order_types || [])
    .map((config) => clean(config?.type))
    .filter((type): type is KitchenOrderType =>
      orderTypes.has(type as KitchenOrderType)
    )
}

function addMenuContextTarget(
  targets: MenuQrTarget[],
  options: {
    menuId: string
    context: MenuRouteContext
    label: string
    description: string
  }
) {
  addTarget(targets, {
    id: `${options.menuId}:${options.context}`,
    label: options.label,
    description: options.description,
    path: menuUrlResolver.menuPath(options.menuId, options.context),
    url: menuUrlResolver.menuUrl(options.menuId, options.context),
  })
}

function addTarget(targets: MenuQrTarget[], target: MenuQrTarget) {
  if (!target.path || !target.url) return
  if (targets.some((existing) => existing.id === target.id)) return

  targets.push(target)
}
</script>
