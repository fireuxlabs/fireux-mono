<template>
  <UDashboardPanel id="workspace-kitchen-dishes">
    <template #header>
      <LayoutsWorkspaceNavbar title="Food &amp; drinks">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="dishes" />
        </template>
      </LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <WorkspaceKitchenDishes />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'
provideKitchenDishesContext('all')

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-dishes',
    label: 'Food & drinks',
    group: '',
    icon: 'i-lucide-utensils',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
