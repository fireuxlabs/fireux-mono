<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-menus">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Menus">
          <template #right>
            <WorkspaceKitchenCapabilityContextInfo capability="menus" />
          </template>
        </LayoutsWorkspaceNavbar>
        <UDashboardToolbar :ui="{ root: 'border-b-0' }"><WorkspaceKitchenMenusSelector /></UDashboardToolbar>
      </template>

      <template #body>
        <WorkspaceHero
          title="Menus"
          description="Organise what you offer. Build menus, arrange sections and prepare them for your guests."
        />
        <WorkspaceKitchenFoodNavigation />
        <WorkspaceKitchenCapabilityAI
          capability="menus"
          :action-targets="menuActionTargets"
        />
        <WorkspaceKitchenMenus />
        <WorkspaceKitchenMenusTools />
        <WorkspaceKitchenMenusCapabilityView />
        <WorkspaceKitchenMenusDiscovery />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenMenusWorkspace } from '../../../../kitchen/composables/workspace/Menus/useKitchenMenusWorkspace'
import WorkspaceKitchenMenusDiscovery from '../../../../kitchen/components/Workspace/Menus/Discovery.vue'
import WorkspaceKitchenMenusCapabilityView from '../../../../kitchen/components/Workspace/Menus/CapabilityView.vue'
import WorkspaceKitchenMenusSelector from '../../../../kitchen/components/Workspace/Menus/Selector.vue'
import WorkspaceKitchenMenusTools from '../../../../kitchen/components/Workspace/Menus/Tools.vue'

const menusWorkspace = provideKitchenMenusWorkspace()
const menuActionTargets = computed(() =>
  menusWorkspace.menus.value.flatMap((menu) =>
    ['kitchen.menus.update-menu', 'kitchen.menus.delete-menu'].map(
      (actionId) => ({
        actionId,
        targetId: menu.id,
        label: String(menu.name || 'Untitled Menu').trim(),
      })
    )
  )
)

definePageMeta({
  layout: 'workspace',
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
