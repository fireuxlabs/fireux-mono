<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-identity-profile">
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
          page-label="Identity"
          hide-description
          placement="top"
        />
        <WorkspaceKitchenIdentityProfile :identity="identity" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import WorkspaceKitchenIdentityProfile from '../../../../kitchen/components/Workspace/Identity/Profile.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import { useKitchenIdentity } from '../../../../kitchen/composables/workspace/identity/useKitchenIdentity'
const identity = useKitchenIdentity()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
const navTitle = 'Venue profile'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-identity-profile',
    label: 'Venue profile',
    description: 'Name, branding, photos, contact details and location',
    group: 'Identity',
    groupDisplay: 'nested',
    groupIcon: 'i-lucide-id-card',
    icon: 'i-lucide-id-card',
    position: 'top',
    order: 81,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
