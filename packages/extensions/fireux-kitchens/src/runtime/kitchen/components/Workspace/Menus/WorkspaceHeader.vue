<template>
  <div class="space-y-4">
    <UBreadcrumb :items="breadcrumbItems" />
    <header class="menu-workspace-header">
      <h1 class="fx-type-card-heading">{{ menuLabel }}</h1>
      <UBadge
        v-if="menu"
        :color="
          menu.status === 'published'
            ? 'success'
            : menu.status === 'archived'
              ? 'neutral'
              : 'warning'
        "
        variant="subtle"
        >{{
          menu.status === 'published'
            ? 'Published'
            : menu.status === 'archived'
              ? 'Archived'
              : 'Draft'
        }}</UBadge
      >
    </header>
    <WorkspaceKitchenMenusNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menus/useKitchenWorkspaceMenu'

const props = withDefaults(
  defineProps<{
    currentLabel?: string
  }>(),
  {
    currentLabel: '',
  }
)

const { menu, menuId, source } = useKitchenWorkspaceMenu()
const menuPath = computed(
  () => `/workspace/kitchen/menus/${encodeURIComponent(menuId.value)}`
)
const menuLabel = computed(() =>
  String(menu.value?.name || source.value?.id || 'Menu').trim()
)
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/workspace/kitchen/menus',
  },
  {
    label: menuLabel.value,
    icon: 'i-lucide-list-tree',
    ...(props.currentLabel ? { to: menuPath.value } : {}),
  },
  ...(props.currentLabel ? [{ label: props.currentLabel }] : []),
])
</script>

<style scoped>
.menu-workspace-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}
</style>
