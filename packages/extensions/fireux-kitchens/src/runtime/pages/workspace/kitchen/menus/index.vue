<template>
  <UDashboardPanel id="workspace-kitchen-menus">
    <template #header>
      <LayoutsWorkspaceNavbar title="Menus">
        <template #right>
          <WorkspaceKitchenCapabilityContextInfo capability="menus" />
        </template>
      </LayoutsWorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"
        ><WorkspaceKitchenMenusSelector
      /></UDashboardToolbar>
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-5xl space-y-8 py-2 sm:py-5">
        <WorkspaceKitchenMenusAi />
        <WorkspaceKitchenMenus />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenMenusContext } from '../../../../kitchen/composables/workspace/menus/useKitchenMenusContext'
import WorkspaceKitchenMenusAi from '../../../../kitchen/components/Workspace/Menus/Ai.vue'
import WorkspaceKitchenMenusSelector from '../../../../kitchen/components/Workspace/Menus/Selector.vue'

provideKitchenMenusContext()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-menus',
    label: 'Menus',
    group: 'Menus & Recipes',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-utensils',
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
