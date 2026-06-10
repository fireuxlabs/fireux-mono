<template>
  <UDashboardPanel id="console-kitchen-recipes">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Recipes" />
    </template>

    <template #body>
      <section class="space-y-4">
        <ConsoleKitchenOperationsRecipes />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-copy',
    position: 'top',
    requiresSelection: true,
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
