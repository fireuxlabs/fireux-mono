<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-identity">
      <template #header>
        <LayoutsWorkspaceNavbar :title="navTitle">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="identity"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <div class="workspace-profile workspace-surface">
          <WorkspaceKitchenCapabilityTools operation="identity" />
          <WorkspaceKitchenCapabilityAI
            operation="identity"
            :show-suggestion-cards="false"
          />
          <div class="workspace-profile__section">
            <ClientOnly>
              <WorkspaceKitchenIdentitySections />
            </ClientOnly>
          </div>
          <WorkspaceKitchenResearchSegue
            capability="Identity"
            base-path="/workspace/kitchen/identity/search-demand"
          />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
const navTitle = 'Identity'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-identity',
    label: 'Identity',
    group: 'Workspace',
    icon: 'i-lucide-id-card',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
