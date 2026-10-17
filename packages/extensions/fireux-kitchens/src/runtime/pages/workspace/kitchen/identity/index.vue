<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-identity">
      <template #header>
        <LayoutsWorkspaceNavbar :title="navTitle">
          <template #right
            ><WorkspaceIntroInfo :intro="identity.intro.value"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="kitchen"
          capability="identity"
          page-label="Kitchen listing"
          hide-description
          placement="top"
        />
        <WorkspaceKitchenIdentity :identity="identity" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useKitchenIdentity } from '../../../../kitchen/composables/workspace/identity/useKitchenIdentity'
const identity = useKitchenIdentity()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
const navTitle = 'Kitchen listing'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-identity',
    label: 'Kitchen listing',
    group: 'Settings',
    groupDisplay: 'nested',
    groupIndex: true,
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-id-card',
    position: 'top',
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
