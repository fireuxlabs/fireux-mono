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
          page-label="Identity"
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
const navTitle = 'Identity'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-identity',
    label: 'Identity',
    group: '',
    icon: 'i-lucide-id-card',
    position: 'top',
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [
      { label: 'Identity', to: '/workspace/kitchen/identity' },
      { label: 'Opening hours', to: '/workspace/kitchen/identity?view=hours' },
      {
        label: 'Directory & colours',
        to: '/workspace/kitchen/identity?view=public',
      },
    ],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
