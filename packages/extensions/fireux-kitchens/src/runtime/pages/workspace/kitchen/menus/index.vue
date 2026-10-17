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
      <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
        <WorkspaceKitchenMenus />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { provideKitchenMenusContext } from '../../../../kitchen/composables/workspace/menus/useKitchenMenusContext'

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
    groupIndex: true,
    group: '',
    children: [
      {
        label: 'Promotions',
        to: '/workspace/kitchen/promotions',
        icon: 'i-lucide-tags',
      },
    ],
    icon: 'i-lucide-book-open',
    position: 'top',
    order: 11,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
