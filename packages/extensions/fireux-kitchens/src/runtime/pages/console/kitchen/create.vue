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
  layout: 'kitchen-console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-console'],
  },
  requiresAuth: true,
})
</script>
