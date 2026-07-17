<template>
  <div class="space-y-4">
    <UBreadcrumb :items="breadcrumbItems" />
    <ConsoleKitchenOperationsMenusCardsProfile
      :menu="operationalMenu"
      :sections-count="sections.length"
    />
    <ConsoleKitchenOperationsMenusNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import type { KitchenMenu } from '../../../../../models/kitchen/menu/kitchen-menu.model'

const props = withDefaults(defineProps<{
  currentLabel?: string
}>(), {
  currentLabel: '',
})

const {
  menu,
  menuId,
  sections,
  source,
} = useKitchenConsoleMenu()
const operationalMenu = computed(() =>
  menu.value as unknown as KitchenMenu | null
)
const menuPath = computed(() =>
  `/console/kitchen/menus/${encodeURIComponent(menuId.value)}`
)
const menuLabel = computed(() =>
  String(menu.value?.name || source.value?.id || 'Menu').trim()
)
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: menuLabel.value,
    icon: 'i-lucide-list-tree',
    ...(props.currentLabel ? { to: menuPath.value } : {}),
  },
  ...(props.currentLabel
    ? [{ label: props.currentLabel }]
    : []),
])
</script>
