<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-drink-create">
      <template #header>
        <LayoutsWorkspaceNavbar title="Create Drink" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UBreadcrumb :items="breadcrumbItems" />
          <WorkspaceKitchenOperationsDishesWrite />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesWorkspace } from '../../../../kitchen/composables/workspace/operations/Dishes/useKitchenDishesWorkspace'

provideKitchenDishesWorkspace('drink')

const breadcrumbItems = [
  { label: 'Drinks', icon: 'i-lucide-glass-water', to: '/workspace/kitchen/drinks' },
  { label: 'Create drink', icon: 'i-lucide-plus' },
]

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-drink-create',
    label: 'Create Drink',
    icon: 'i-lucide-plus',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
