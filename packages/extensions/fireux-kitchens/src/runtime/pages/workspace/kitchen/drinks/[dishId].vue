<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-drink-detail">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Drink" />
      </template>

      <template #body>
        <section class="space-y-4">
          <WorkspaceKitchenDishesDish />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenDishesContext } from '../../../../kitchen/composables/workspace/dishes/useKitchenDishesContext'

provideKitchenDishesContext('drink')

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'detail',
  visibility: { modules: ['fireux-kitchens'] },
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-drink-detail',
    label: 'Drink Detail',
    icon: 'i-lucide-glass-water',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
})
</script>
