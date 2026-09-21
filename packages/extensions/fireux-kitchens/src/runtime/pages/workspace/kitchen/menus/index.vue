<template>
  <UDashboardPanel id="workspace-kitchen-menus">
    <template #header>
      <LayoutsWorkspaceNavbar title="Menus">
        <template #right>
          <WorkspaceKitchenAICapabilityInfo capability="menus" />
        </template>
      </LayoutsWorkspaceNavbar>
    </template>

    <template #body>
      <div class="mx-auto grid w-full max-w-6xl gap-6">
        <WorkspaceKitchenMenus />
        <MoleculesDisclosurePanel title="KitchenAI" :default-open="false">
          <WorkspaceKitchenMenusAi />
        </MoleculesDisclosurePanel>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenMenusContext } from '../../../../kitchen/composables/workspace/menus/useKitchenMenusContext'
import WorkspaceKitchenMenusAi from '../../../../kitchen/components/Workspace/Menus/Ai.vue'

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
