<template>
  <UDashboardPanel id="console-kitchen-ingredients">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenIngredients />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    position: 'top',
    requiresSelection: true,
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
