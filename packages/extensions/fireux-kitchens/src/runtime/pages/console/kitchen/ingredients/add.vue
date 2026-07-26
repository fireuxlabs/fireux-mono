<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-ingredient-add">
      <template #header>
        <LayoutsConsoleNavbar title="Add Kitchen Ingredient" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UBreadcrumb :items="breadcrumbItems" />
          <ConsoleKitchenOperationsIngredientsWrite />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const breadcrumbItems = [
  {
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    to: '/console/kitchen/ingredients',
  },
  {
    label: 'Add ingredient',
    icon: 'i-lucide-plus',
  },
]

definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-ingredient-add',
    label: 'Add Ingredient',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
