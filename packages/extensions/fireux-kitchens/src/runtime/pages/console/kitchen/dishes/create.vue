<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-dish-create">
      <template #header>
        <LayoutsConsoleNavbar title="Create Dish" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UBreadcrumb :items="breadcrumbItems" />
          <ConsoleKitchenOperationsDishesWrite />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/console/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace('food')

const breadcrumbItems = [
  {
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    to: '/console/kitchen/dishes',
  },
  {
    label: 'Create dish',
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
    key: 'console-kitchen-dish-create',
    label: 'Create Dish',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['console'],
  },
})
</script>
