<template>
  <UDashboardPanel id="console-kitchen-create">
    <template #header>
      <LayoutsConsoleNavbar title="Create Kitchen" />
    </template>

    <template #body>
      <section class="space-y-4">
        <KitchenCreateSystem
          mode="console"
          return-to="/console/kitchen"
          cancel-to="/console/kitchen"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import KitchenCreateSystem from '../../../components/Kitchen/Create/System.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-create',
    label: 'Create',
    icon: 'i-lucide-plus',
    position: 'bottom',
    requiresSelection: false,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
