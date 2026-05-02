<template>
  <UDashboardPanel id="console-kitchen-dish-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dish" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenDish />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dish-detail',
    label: 'Dish Detail',
    icon: 'i-lucide-utensils',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
