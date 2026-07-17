<template>
  <section class="kitchen-menus" aria-labelledby="kitchen-menus-title">
    <header class="kitchen-menus__header">
      <div>
        <p class="kitchen-menus__eyebrow">Explore</p>
        <h2 id="kitchen-menus-title">{{ defaultChromeLabels.menus }}</h2>
      </div>

      <UButton
        v-if="menusIndexLink && sortedMenus.length > 1"
        size="sm"
        variant="ghost"
        color="neutral"
        trailing-icon="i-lucide-arrow-right"
        :to="menusIndexLink"
      >
        {{ defaultChromeLabels.openMenus }}
      </UButton>
    </header>

    <div class="kitchen-menus__body">
      <ClientOnly>
        <div
          v-if="activeSessions.length"
          class="kitchen-menus__sessions"
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

      <div v-if="menusLoading" class="kitchen-menus__state">
        <UIcon name="i-lucide-loader-circle" class="animate-spin" />
        {{ defaultChromeLabels.loadingMenus }}
      </div>

      <div v-else-if="!sortedMenus.length" class="kitchen-menus__state">
        <UIcon name="i-lucide-book-open" />
        {{ defaultChromeLabels.noMenusAvailable }}
      </div>

      <div v-else class="kitchen-menus__grid">
        <MenuPublicCard
          v-for="menu in sortedMenus"
          :key="menu.id"
          :menu="menu"
          :route-scope="menuRouteScope"
        />
      </div>
    </div>
  </section>
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
import type { KitchenMenu as Menu } from '../../../models/kitchen/menu/kitchen-menu.model'
import type { KitchenOrderType } from '../../../models/kitchen/order.model'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
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
  openMenus: 'See all menus',
  loadingMenus: 'Loading menus...',
  noMenusAvailable: 'No menus available',
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

const hasOrderType = (menu: Menu, types: KitchenOrderType[]) =>
  Boolean(menu.ordering?.order_types?.some((row) => types.includes(row.type)))
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
</script>

<style scoped>
.kitchen-menus {
  display: grid;
  gap: 1.25rem;
}

.kitchen-menus__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.kitchen-menus__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kitchen-menus h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.kitchen-menus__body {
  display: grid;
  gap: 1rem;
}

.kitchen-menus__sessions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--ui-primary) 7%, transparent);
}

.kitchen-menus__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 25rem), 1fr));
  gap: 1rem;
}

.kitchen-menus__state {
  display: flex;
  min-height: 8rem;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 1px dashed var(--ui-border);
  border-radius: 1.25rem;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

.kitchen-menus__state :deep(svg) {
  width: 1rem;
  height: 1rem;
}
</style>
