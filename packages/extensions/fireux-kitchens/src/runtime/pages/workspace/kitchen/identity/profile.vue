<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-identity-profile">
      <template #header>
        <WorkspaceNavbar :title="navTitle">
          <template #right
            ><WorkspaceIntroInfo :intro="identity.intro.value"
          /></template>
        </WorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceFreemium
          family="kitchen"
          capability="identity"
          page-label="Identity"
          hide-description
          placement="top"
        />
        <KitchenIdentityProfile :identity="identity" />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import KitchenIdentityProfile from '../../../../kitchen/components/Identity/Profile.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import { useKitchenWorkspaceIdentity } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceIdentity'
const identity = useKitchenWorkspaceIdentity()
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
const navTitle = 'Venue profile'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    hidden: true,
    key: 'workspace-kitchen-identity-profile',
    label: 'Venue profile',
    description: 'Name, branding, photos, contact details and location',
    group: 'Identity & brand',
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
