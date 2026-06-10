<template>
  <UDashboardPanel id="console-kitchen-recipe-detail">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Recipe" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsRecipesRecipe />
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
    key: 'console-kitchen-recipe-detail',
    label: 'Recipe Detail',
    icon: 'i-lucide-book-copy',
    position: 'top',
    requiresSelection: true,
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
