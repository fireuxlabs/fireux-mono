<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-menus">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Menus">
          <template #right>
            <WorkspaceKitchenCapabilityContextInfo operation="menus" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceKitchenMenusSelector />
        <WorkspaceHero
          title="Build your Kitchen Menus"
          description="Create, structure, publish, and manage this Kitchen's Menus."
        />
        <WorkspaceKitchenCapabilityAI
          operation="menus"
          :action-targets="menuActionTargets"
        />
        <WorkspaceKitchenMenus />
        <WorkspaceKitchenMenusTools />
        <WorkspaceKitchenMenusOperations />
        <WorkspaceKitchenMenusDiscovery />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenMenusWorkspace } from '../../../../kitchen/composables/workspace/Menus/useKitchenMenusWorkspace'
import WorkspaceKitchenMenusDiscovery from '../../../../kitchen/components/Workspace/Menus/Discovery.vue'
import WorkspaceKitchenMenusOperations from '../../../../kitchen/components/Workspace/Menus/Operations.vue'
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
    group: 'Food & Drink',
    icon: 'i-lucide-book-open',
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
