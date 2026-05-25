<template>
  <UDashboardPanel id="console-kitchen-ingredient-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Ingredient" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenIngredient />
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
    key: 'console-kitchen-ingredient-detail',
    label: 'Ingredient Detail',
    icon: 'i-lucide-carrot',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
