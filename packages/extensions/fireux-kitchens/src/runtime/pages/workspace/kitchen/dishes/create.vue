<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-dish-create">
      <template #header>
        <LayoutsWorkspaceNavbar title="Create Dish" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UBreadcrumb :items="breadcrumbItems" />
          <WorkspaceKitchenDishesWrite />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace('food')

const breadcrumbItems = [
  {
    label: 'Dishes',
    icon: 'i-lucide-utensils',
    to: '/workspace/kitchen/dishes',
  },
  {
    label: 'Create dish',
    icon: 'i-lucide-plus',
  },
]

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-dish-create',
    label: 'Create Dish',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
