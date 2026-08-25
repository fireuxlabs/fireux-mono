<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-menus">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Menus" />
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="menus" />
          <WorkspaceKitchenCapabilityAI
            operation="menus"
            :action-targets="menuActionTargets"
          />
          <WorkspaceKitchenCapabilityView operation="menus" />
          <WorkspaceKitchenMenus />
          <WorkspaceKitchenCapabilityGuidingLiterature operation="menus" />
          <WorkspaceKitchenResearchSegue
            capability="Menus"
            base-path="/workspace/kitchen/menus/search-demand"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenMenusWorkspace } from '../../../../kitchen/composables/workspace/Menus/useKitchenMenusWorkspace'

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
