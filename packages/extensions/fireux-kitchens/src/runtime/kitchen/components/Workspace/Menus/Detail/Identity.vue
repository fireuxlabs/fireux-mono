<template>
  <p v-if="pending" role="status" class="fx-type-caption">Loading Menu…</p>
  <UAlert v-else-if="error" color="error" title="Menu could not be loaded">
    <template #description
      ><MoleculesCopyError message="Menu could not be loaded"
    /></template>
  </UAlert>
  <div v-else-if="menu" class="menu-heading-region">
    <header class="menu-heading">
      <div class="menu-identity-bar">
        <h1 class="menu-identity-bar__name">{{ menu.internal_name || menu.name || menu.id }}</h1>
        <span
          v-if="currencyCode"
          class="text-sm text-muted"
          :aria-label="`Prices in ${currencyCode}`"
          >{{ currencyCode }}</span
        >
        <UBadge
          :color="menu.status === 'published' ? 'success' : 'neutral'"
          variant="subtle"
          >{{ statusLabel }}</UBadge
        >
      </div>
      <UButton
        v-if="menu.status === 'published' && publicUrl"
        :to="publicUrl"
        target="_blank"
        label="Open Menu"
        icon="i-lucide-external-link"
        color="neutral"
        variant="outline"
      />
    </header>
  </div>
  <UAlert v-else color="neutral" title="Menu not found" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  tenantMenuRouteScope,
  directoryMenuRouteScope,
} from '../../../../../menu/utils/menu-route'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { menuWebsiteOrigin } from '../../../../utils/menu-website-snippet'
const { menu, menuSlug, pending, error, selectedKitchen, currencyCode } =
  useKitchenMenuRecordContext()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const publicPath = computed(() =>
  menuRoutePath({
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(selectedKitchen.value?.slug),
    menuId: menuSlug.value,
  })
)
const publicUrl = computed(() =>
  origin && publicPath.value ? new URL(publicPath.value, origin).href : ''
)
const statusLabel = computed(() =>
  menu.value?.status === 'published'
    ? 'Published'
    : menu.value?.status === 'archived'
      ? 'Archived'
      : 'Unpublished'
)
</script>
<style scoped>
.menu-heading-region {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.menu-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 5);
  padding-block: calc(var(--spacing) * 3);
}
.menu-identity-bar {
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
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  letter-spacing: -0.025em;
}
</style>
