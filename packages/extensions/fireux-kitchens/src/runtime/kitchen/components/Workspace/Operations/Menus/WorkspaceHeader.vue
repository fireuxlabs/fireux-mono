<template>
  <div class="space-y-4">
    <UBreadcrumb :items="breadcrumbItems" />
    <WorkspaceKitchenOperationsMenusCardsProfile
      :menu="operationalMenu"
      :sections-count="sections.length"
    />
    <WorkspaceKitchenOperationsMenusNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenu } from '../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenu'

const props = withDefaults(
  defineProps<{
    currentLabel?: string
  }>(),
  {
    currentLabel: '',
  }
)

const { menu, menuId, sections, source } = useKitchenWorkspaceMenu()
const operationalMenu = computed(() => menu.value)
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
