<template>
  <section class="kitchen-menus" aria-labelledby="kitchen-menus-title">
    <header class="kitchen-menus__header">
      <div>
        <p class="kitchen-menus__eyebrow">Explore</p>
        <h2 id="kitchen-menus-title">{{ defaultChromeLabels.menus }}</h2>
      </div>

      <UButton
        v-if="menusIndexLink && (hasMoreMenus || sortedMenus.length > 1)"
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

      <div v-else-if="menusUnavailable" class="kitchen-menus__state" role="alert">
        <UIcon name="i-lucide-circle-alert" />
        {{ defaultChromeLabels.menusUnavailable }}
      </div>

      <div v-else-if="!sortedMenus.length" class="kitchen-menus__state">
        <UIcon name="i-lucide-book-open" />
        {{ defaultChromeLabels.noMenusAvailable }}
      </div>

      <div v-else class="kitchen-menus__grid">
        <MenuCardsPreview
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
import { usePublicMenuIndex } from '../../../composables/fireux/menu/usePublicMenuIndex'
import {
  orderSessionContextForOrderType,
  useOrderSessionSummaries,
  type MenuOrderSessionSummary,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useOrderSession'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import {
  directoryMenuRouteScope,
  menuRouteIndexPath,
  menuRoutePath,
} from '../../../utils/kitchen-menu-route'

const props = defineProps<{
  kitchen: KitchenSurface
}>()

const kitchenSlug = computed(() => String((props.kitchen as any)?.slug ?? '').trim())
const defaultChromeLabels = {
  menus: 'Menus',
  openMenus: 'See all menus',
  loadingMenus: 'Loading menus...',
  menusUnavailable: 'Menus are unavailable right now.',
  noMenusAvailable: 'No menus available',
}
const { sessions: activeSessions } = useOrderSessionSummaries(kitchenSlug)
const menuRouteScope = computed(() => directoryMenuRouteScope(kitchenSlug.value))
const menuIndex = usePublicMenuIndex({
  routeScope: menuRouteScope,
  pageSize: 4,
})

const menusLoading = computed(() => menuIndex.pending.value)
const menusUnavailable = computed(() =>
  menuIndex.outcome.value.kind === 'unavailable'
)
const hasMoreMenus = computed(() => menuIndex.hasMore.value)
const sortedMenus = computed(() => menuIndex.menus.value)

const menusIndexLink = computed(() => {
  return menuRouteIndexPath(menuRouteScope.value)
})

const sessionLink = (session: MenuOrderSessionSummary) => {
  const context = orderSessionContextForOrderType(session.orderType)
  const menuId = session.firstMenuId || sortedMenus.value.find((menu) =>
    menu.contexts?.includes(context)
  )?.id

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
  gap: calc(var(--spacing) * 5);
}

.kitchen-menus__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.kitchen-menus__eyebrow {
  margin: 0 0 var(--spacing);
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kitchen-menus h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-2xl), 3vw, 2rem);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.kitchen-menus__body {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.kitchen-menus__sessions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  padding: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, transparent);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-primary) 7%, transparent);
}

.kitchen-menus__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 25rem), 1fr));
  gap: calc(var(--spacing) * 4);
}

.kitchen-menus__state {
  display: flex;
  min-height: 8rem;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 1px dashed var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

.kitchen-menus__state :deep(svg) {
  width: 1rem;
  height: 1rem;
}
</style>
