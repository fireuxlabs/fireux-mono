<template>
  <p v-if="pending" role="status" class="fx-type-caption">Loading Menu…</p>
  <UAlert v-else-if="error" color="error" title="Menu could not be loaded">
    <template #description
      ><FireCopyError message="Menu could not be loaded"
    /></template>
  </UAlert>
  <div v-else-if="menu" class="menu-record-heading-region">
    <header class="menu-record-heading" :style="themeStyle">
      <div class="menu-record-identity">
        <div class="menu-record-identity__meta">
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
        <h1 class="menu-record-identity__name">
          {{ menu.internal_name || menu.name || menu.id }}
        </h1>
        <p v-if="menu.description" class="menu-record-identity__description">
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
    '--menu-record-heading-canvas': palette.canvas,
    '--menu-record-heading-accent': palette.accent,
  }
})
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const publicPath = computed(() =>
  menuRoutePath({
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(selectedKitchen.value?.identity.slug),
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
@import '../../record-detail.css';
.menu-record-heading-region {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
</style>
