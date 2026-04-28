<template>
  <UDashboardPanel id="console-kitchen-dishes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Dishes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenDishes />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-dishes',
    label: 'Dishes',
    icon: 'i-lucide-cooking-pot',
    position: 'top',
    requiresSelection: true,
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
