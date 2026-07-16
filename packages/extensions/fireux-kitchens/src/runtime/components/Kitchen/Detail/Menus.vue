<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm font-semibold">{{ defaultChromeLabels.menus }}</div>
      </div>
    </template>

    <div class="space-y-4">
      <ClientOnly>
        <div
          v-if="activeSessions.length"
          class="flex flex-wrap gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3"
        >
          <UButton
            v-for="session in activeSessions"
            :key="session.key"
            :to="sessionLink(session)"
            color="primary"
            variant="soft"
            size="sm"
            icon="i-lucide-shopping-basket"
          >
            {{ session.quantity }} · {{ session.label }} basket
          </UButton>
        </div>
      </ClientOnly>

      <UButton
        v-if="menusIndexLink"
        size="sm"
        variant="soft"
        color="primary"
        icon="i-lucide-book-open-check"
        :to="menusIndexLink"
      >
        {{ defaultChromeLabels.openMenus }}
      </UButton>

      <div v-if="menusLoading" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.loadingMenus }}
      </div>

      <div v-else-if="!sortedMenus.length" class="py-4 text-sm text-dimmed">
        {{ defaultChromeLabels.noMenusAvailable }}
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <KitchenDetailMenuLink
          v-for="menu in sortedMenus"
          :key="menu.id"
          :menu="menu"
          :entries="menuEntries(menu)"
          :summary="defaultChromeLabels.openMenu"
        />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePublicAppScopedSource } from 'fireux-core/runtime/composables/fireux/public/scoped/usePublicScopedEntity'
import { useKitchenMenuCollection } from '../../../composables/fireux/firestore/menu/fetch/useKitchenMenuCollection'
import {
  orderSessionContextForOrderType,
  useOrderSessionSummaries,
  type MenuOrderSessionSummary,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useOrderSession'
import KitchenDetailMenuLink from './MenuLink.vue'
import type { Menu } from '../../../models/kitchen/menu/menu.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import type { KitchenOrderType } from '../../../models/kitchen/order.model'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { publicMenuSurfaceProfiles } from '../../../utils/menu-context'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
} from '../../../utils/kitchen-menu-route'

const props = defineProps<{
  kitchen: KitchenSurface
}>()

const kitchenId = computed(() => String(props.kitchen?.id ?? '').trim())
const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())
const appScope = usePublicAppScopedSource(computed(() => props.kitchen))
const kitchenCollectionPath = computed(() =>
  appScope.sourceAppId.value
    ? `apps/${appScope.sourceAppId.value}/kitchens`
    : ''
)
const defaultChromeLabels = {
  menus: 'Menus',
  openMenus: 'Open menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
  openMenu: 'Open menu',
}
const { publishedMenus, pending: menusPending } = useKitchenMenuCollection(
  kitchenId,
  { kitchenCollectionPath }
)
const { sessions: activeSessions } = useOrderSessionSummaries(kitchenSlug)
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))

const menusLoading = computed(() =>
  Boolean(kitchenId.value) && menusPending.value
)
const sortedMenus = computed(() =>
  [...publishedMenus.value].sort(
    (a, b) =>
      Number((a as any)?.sort_order || 0) -
        Number((b as any)?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const menusIndexLink = computed(() => {
  return menuRouteIndexPath(menuRouteScope.value)
})

const menuLink = (menuIdRaw: unknown) => {
  const menuId = String(menuIdRaw || '').trim()
  return menuRoutePath({
    scope: menuRouteScope.value,
    menuId,
  })
}
const hasOrderType = (menu: Menu, types: KitchenOrderType[]) =>
  Boolean(menu.ordering?.order_types?.some((row) => types.includes(row.type)))
const contextualMenuLink = (menu: Menu, context: MenuRouteContext) =>
  menuRoutePath({
    scope: menuRouteScope.value,
    menuId: menu.id,
    context,
  })
const firstMenuForOrderType = (orderType: KitchenOrderType) =>
  sortedMenus.value.find((menu) => hasOrderType(menu, [orderType])) ||
    sortedMenus.value.find((menu) =>
      hasOrderType(menu, orderType === 'delivery' || orderType === 'collection'
        ? ['delivery', 'collection']
        : orderType === 'eat_in' || orderType === 'takeaway'
          ? ['eat_in', 'takeaway']
          : [orderType])
    )
const sessionLink = (session: MenuOrderSessionSummary) => {
  const menuId = session.firstMenuId || firstMenuForOrderType(session.orderType)?.id
  const context = orderSessionContextForOrderType(session.orderType)

  return menuRoutePath({
    scope: menuRouteScope.value,
    menuId,
    context,
  })
}
const menuEntries = (menu: Menu) => [
  {
    label: 'Browse',
    to: menuLink(menu.id),
    icon: 'i-lucide-book-open',
  },
  ...publicMenuSurfaceProfiles
    .filter((surface) => hasOrderType(menu, [...surface.visibleOrderTypes]))
    .map((surface) => ({
      label: surface.label,
      to: contextualMenuLink(menu, surface.context),
      icon: surface.icon,
    })),
].filter((entry) => entry.to)
</script>
