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
          to: `/console/kitchen/menus/${encodeURIComponent(draftSource.id)}`,
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
      <ConsoleKitchenOperationsMenusQRMenuPanel
        v-for="panel in menuPanels"
        :key="panel.id"
        :panel="panel"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenus } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenMenuUrl } from '../../../../../../composables/fireux/kitchen/menu/useKitchenMenuUrl'
import type { KitchenOrderType } from '../../../../../../models/kitchen/order.model'
import type { Menu } from '../../../../../../models/kitchen/menu/menu.model'
import type { MenuRouteContext } from '../../../../../../models/kitchen/menu/menu-context.model'
import { menuOrderTypeLabel } from '../../../../../../utils/menu-ordering-ui'
import ConsoleKitchenOperationsMenusQRMenuPanel from './MenuPanel.vue'
import type { MenuQrPanel, MenuQrTarget } from './types'

const { selectedKitchen, menus, menuSources, activeKitchenAppId } =
  useKitchenConsoleMenus()

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
const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const kitchenSlug = computed(() => clean(kitchen.value?.slug))
const menuUrlResolver = useKitchenMenuUrl({
  appId: activeKitchenAppId,
  kitchenSlug,
})
const menuPanels = computed(() => buildMenuPanels(menus.value))
const draftSource = computed(() =>
  menuSources.value.find((source) => clean(source.status) === 'draft') ?? null
)

function buildMenuPanels(sourceMenus: Menu[]): MenuQrPanel[] {
  return sourceMenus
    .map((menu) => {
      const menuId = clean(menu.id)
      if (!menuId) return null

      const menuName = clean(menu.name) || menuId
      const targets = menu.status === 'published'
        ? buildQrTargets(menu, menuId)
        : []

      return {
        id: menuId,
        label: menuName,
        description: clean(menu.description),
        status: menu.status,
        summary: menu.status === 'published'
          ? describeMenuPanel(targets)
          : 'Publish this menu before creating guest entries.',
        editPath: `/console/kitchen/menus/${encodeURIComponent(menuId)}`,
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

  if (enabledTypes.includes('delivery') || enabledTypes.includes('collection')) {
    const homeModes = enabledTypes
      .filter((type) => type === 'delivery' || type === 'collection')
      .map((type) => menuOrderTypeLabel(type))
      .join(', ')

    addMenuContextTarget(targets, {
      menuId,
      context: 'home',
      label: 'Home Delivery',
      description: homeModes || 'Delivery and collection.',
    })
  }

  if (enabledTypes.includes('dine_in')) {
    addMenuContextTarget(targets, {
      menuId,
      context: 'dine_in',
      label: 'Dine in',
      description: 'Dine in.',
    })
  }

  if (enabledTypes.includes('eat_in') || enabledTypes.includes('takeaway')) {
    const kioskModes = enabledTypes
      .filter((type) => type === 'eat_in' || type === 'takeaway')
      .map((type) => menuOrderTypeLabel(type))
      .join(', ')

    addMenuContextTarget(targets, {
      menuId,
      context: 'kiosk',
      label: 'Kiosk Ordering',
      description: kioskModes || 'Eat in and takeaway.',
    })
  }

  ;([
    'pre_order',
    'room_service',
  ] as const).forEach((type) => {
    if (!enabledTypes.includes(type)) return

    addMenuContextTarget(targets, {
      menuId,
      context: type,
      label: menuOrderTypeLabel(type),
      description: `${menuOrderTypeLabel(type)} funnel.`,
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

function addMenuContextTarget(targets: MenuQrTarget[], options: {
  menuId: string
  context: MenuRouteContext
  label: string
  description: string
}) {
  const contextualMenuId = `${options.menuId}.${options.context}`

  addTarget(targets, {
    id: `${options.menuId}:${options.context}`,
    label: options.label,
    description: options.description,
    path: menuUrlResolver.menuPath(contextualMenuId),
    url: menuUrlResolver.menuUrl(contextualMenuId),
  })
}

function addTarget(targets: MenuQrTarget[], target: MenuQrTarget) {
  if (!target.path || !target.url) return
  if (targets.some((existing) => existing.id === target.id)) return

  targets.push(target)
}
</script>
