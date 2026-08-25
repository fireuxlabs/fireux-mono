<template>
  <div>
    <NuxtPage v-if="hasMemberRoute" />
    <UDashboardPanel v-else id="workspace-kitchen-team">
      <template #header>
        <LayoutsWorkspaceNavbar title="Team">
          <template #right
            ><WorkspaceKitchenCapabilityContextInfo operation="team"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenTeamTools />
          <WorkspaceKitchenTeamAI />
          <WorkspaceKitchenTeam v-if="hasTeam" />
          <WorkspaceKitchenResearchSegue
            capability="Team"
            base-path="/workspace/kitchen/team/search-demand"
          />
          <WorkspaceKitchenTeamToolMap v-if="isDevelopment" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { provideKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const team = provideKitchenWorkspaceTeam()
const hasTeam = computed(() => team.teamMembers.value.length > 0)
const memberSlug = useRouteParam('memberSlug')
const hasMemberRoute = computed(() => Boolean(memberSlug.value))
const isDevelopment = import.meta.dev

definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  workspaceAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-team',
    label: 'Team',
    group: 'Workspace',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
