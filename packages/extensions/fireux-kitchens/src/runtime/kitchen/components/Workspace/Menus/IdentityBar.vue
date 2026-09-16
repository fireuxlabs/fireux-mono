<template>
  <p v-if="pending" role="status" class="fx-type-caption">Loading Menu…</p>
  <UAlert v-else-if="error" color="error" title="Menu could not be loaded">
    <template #description
      ><MoleculesCopyError message="Menu could not be loaded"
    /></template>
  </UAlert>
  <div v-else-if="menu" class="menu-heading-region">
    <UButton to="/workspace/kitchen/menus" label="Menus" icon="i-lucide-arrow-left" color="neutral" variant="link" class="menu-heading__back" />
    <header class="menu-heading">
    <header class="menu-identity-bar">
      <div class="menu-identity-bar__text">
        <h1 class="menu-identity-bar__name">{{ menu.name || menu.id }}</h1>
        <UBadge :color="menu.status === 'published' ? 'success' : 'neutral'" variant="subtle">{{ statusLabel }}</UBadge>
      </div>
    </header>
    <div class="menu-heading__actions">
      <UButton v-if="menu.status === 'published'" :to="publicPath" label="View Menu" icon="i-lucide-external-link" color="neutral" variant="outline" />
      <UButton :to="`${path}/content`" label="Items & prices" icon="i-lucide-list-tree" color="primary" variant="solid" />
    </div>
    </header>
  </div>
  <UAlert v-else color="neutral" title="Menu not found" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { menuRoutePath, tenantMenuRouteScope, directoryMenuRouteScope } from '../../../utils/kitchen-menu-route'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenWorkspaceMenus } from '../../../composables/workspace/menus/useKitchenWorkspaceMenus'
const menuId = useRouteParam('menuId')
const { rawMenus, pending, error, selectedKitchen } = useKitchenWorkspaceMenus()
const menu = computed(() =>
  rawMenus.value.find((item) => item.id === menuId.value)
)
const fireux = useFireUXConfig()
const path = computed(() => `/workspace/kitchen/menus/${encodeURIComponent(menuId.value)}`)
const publicPath = computed(() => menuRoutePath({ scope: fireux.isTenant ? tenantMenuRouteScope() : directoryMenuRouteScope(selectedKitchen.value?.slug), menuId: menuId.value }))
const statusLabel = computed(() => menu.value?.status === 'published' ? 'Published' : menu.value?.status === 'archived' ? 'Archived' : 'Draft')
</script>
<style scoped>
.menu-heading-region { display: grid; gap: calc(var(--spacing) * 4); }
.menu-heading__back { justify-self: start; padding: 0; }
.menu-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 5);
  padding-block: calc(var(--spacing) * 3);
}
.menu-heading__actions { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 2); }

.menu-identity-bar {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 4);
}
.menu-identity-bar__text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  overflow-wrap: anywhere;
}
.menu-identity-bar__name {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  letter-spacing: -0.025em;
}
</style>
