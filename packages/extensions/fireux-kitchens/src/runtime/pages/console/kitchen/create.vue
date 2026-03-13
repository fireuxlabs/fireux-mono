<template>
  <UDashboardPanel id="console-kitchen-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Kitchen" />
    </template>

    <template #body>
      <KitchenCreateSystem />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import KitchenCreateSystem from '../../../components/organisms/Kitchen/Create/System.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
