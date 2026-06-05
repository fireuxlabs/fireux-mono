<template>
  <section class="console-surface space-y-6">
    <UBreadcrumb :items="breadcrumbItems" />
    <ConsoleKitchenMenusDetails />
    <ConsoleKitchenMenusSectionsRead />
    <ConsoleKitchenMenusSectionsCreate />
    <ConsoleKitchenMenusPublish />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenu } from '../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'

const { menu } = useKitchenConsoleMenu()
const breadcrumbItems = computed(() => [
  {
    label: 'Menus',
    icon: 'i-lucide-book-open',
    to: '/console/kitchen/menus',
  },
  {
    label: String(menu.value?.name || 'Menu details').trim(),
    icon: 'i-lucide-list-tree',
  },
])
</script>
