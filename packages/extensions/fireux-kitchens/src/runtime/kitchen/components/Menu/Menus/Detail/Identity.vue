<template>
  <p v-if="pending" role="status" class="fx-type-caption">Loading Menu…</p>
  <UAlert v-else-if="error" color="error" title="Menu could not be loaded">
    <template #description
      ><FireCopyError message="Menu could not be loaded"
    /></template>
  </UAlert>
  <div v-else-if="menu" class="menu-heading-region">
    <header class="menu-heading" :style="themeStyle">
      <div class="menu-identity-bar">
        <div class="menu-identity-bar__meta">
          <span
            v-if="currencyCode"
            class="fx-type-caption"
            :aria-label="`Prices in ${currencyCode}`"
            >{{ currencyCode }}</span
          >
          <UBadge
            :color="menu.status === 'published' ? 'success' : 'neutral'"
            variant="subtle"
            >{{ statusLabel }}</UBadge
          >
        </div>
        <h1 class="menu-identity-bar__name">
          {{ menu.internal_name || menu.name || menu.id }}
        </h1>
        <p v-if="menu.description" class="menu-identity-bar__description">
          {{ menu.description }}
        </p>
      </div>
      <UButton
        v-if="menu.status === 'published' && publicUrl"
        :to="publicUrl"
        target="_blank"
        rel="noopener"
        label="View menu"
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
} from '../../../../../menu/utils/navigation/route'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { readKitchenThemePalette } from '../../../../utils/kitchen-readers'
import { menuWebsiteOrigin } from '../../../../utils/menu-website-snippet'
const { menu, menuSlug, pending, error, selectedKitchen, currencyCode } =
  useKitchenMenuRecordContext()
const themeStyle = computed(() => {
  if (
    !menu.value ||
    menu.value.theme_mode === 'default' ||
    !selectedKitchen.value
  )
    return
  const palette = readKitchenThemePalette(selectedKitchen.value)
  if (!palette) return
  return {
    '--menu-heading-canvas': palette.canvas,
    '--menu-heading-accent': palette.accent,
  }
})
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
  padding: clamp(1rem, 3vw, 2rem);
  border: 1px solid var(--ui-border);
  border-inline-start: 3px solid var(--menu-heading-accent, var(--ui-primary));
  border-radius: calc(var(--ui-radius) * 2);
  background-color: var(--menu-heading-canvas, var(--ui-bg-elevated));
}
.menu-identity-bar {
  display: grid;
  gap: calc(var(--spacing) * 2);
  min-width: 0;
  overflow-wrap: anywhere;
}
.menu-identity-bar__meta {
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
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: var(--font-weight-semibold);
  line-height: 1.15;
  letter-spacing: -0.025em;
}
.menu-identity-bar__description {
  color: var(--ui-text-muted);
  margin: 0;
  max-width: 60ch;
}
</style>
