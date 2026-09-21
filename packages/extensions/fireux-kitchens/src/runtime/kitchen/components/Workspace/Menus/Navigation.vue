<template>
  <nav aria-label="Menu configuration" class="menu-configuration-nav">
    <UButton
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :label="item.label"
      :icon="item.icon"
      color="neutral"
      :variant="isActive(item.to) ? 'soft' : 'ghost'"
      :aria-current="isActive(item.to) ? 'page' : undefined"
    />
  </nav>
</template>
<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const route = useRoute()
import { useKitchenWorkspaceMenuRecord } from '../../../composables/workspace/menus/useKitchenWorkspaceMenuRecord'
const { menu } = useKitchenWorkspaceMenuRecord()
const menuSlug = useRouteParam('menuSlug')
const basePath = computed(
  () => `/workspace/kitchen/menus/${encodeURIComponent(menuSlug.value)}`
)
const items = computed(() => [
  { label: 'Details', icon: 'i-lucide-settings-2', to: basePath.value },
  {
    label: menu.value?.schedule === 'daily' ? 'Calendar' : 'Items & prices',
    icon:
      menu.value?.schedule === 'daily'
        ? 'i-lucide-calendar-days'
        : 'i-lucide-list-tree',
    to: `${basePath.value}/content`,
  },
  {
    label: 'Publishing',
    icon: 'i-lucide-globe',
    to: `${basePath.value}/publishing`,
  },
  {
    label: 'Source',
    icon: 'i-lucide-file-scan',
    to: `${basePath.value}/source`,
  },
])
function isActive(path: string) {
  const current = route.path.replace(/\/$/, '')
  return (
    current === path ||
    (path !== basePath.value && current.startsWith(`${path}/`))
  )
}
</script>
<style scoped>
.menu-configuration-nav {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
</style>
