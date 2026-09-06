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
          placement="top"
        />
        <div class="workspace-profile workspace-surface">
          <WorkspaceKitchenIdentityAI
            :identity="identity"
            @action="profile?.openAction($event)"
          />
          <WorkspaceKitchenIdentityProfile ref="profile" :identity="identity" />
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
        <WorkspaceFreemium
          family="kitchen"
          capability="identity"
          page-label="Identity"
          placement="bottom"
        />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'
import WorkspaceKitchenIdentityAI from '../../../../kitchen/components/Workspace/Identity/AI.vue'
import WorkspaceKitchenIdentityProfile from '../../../../kitchen/components/Workspace/Identity/Profile.vue'
import { useKitchenIdentityPage } from '../../../../kitchen/composables/workspace/identity/useKitchenIdentityPage'
const identity = useKitchenIdentityPage()
const profile = ref<InstanceType<typeof WorkspaceKitchenIdentityProfile>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
const navTitle = 'Identity'

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
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
  requiresAuth: true,
  requiresSelection: true,
})
</script>
