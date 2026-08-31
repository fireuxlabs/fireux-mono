<template>
  <div>
    <UDashboardPanel
      id="workspace-kitchen-team"
      :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }"
    >
      <template #header>
        <LayoutsWorkspaceNavbar title="Team">
          <template #right>
            <WorkspaceKitchenCapabilityContextInfo operation="team" />
          </template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <WorkspaceKitchenTeamSelector />
        <WorkspaceKitchenTeamHero />
        <WorkspaceKitchenTeamAI />
        <WorkspaceKitchenTeam />
        <WorkspaceKitchenTeamTools />
        <WorkspaceKitchenTeamDiscovery />
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { provideKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

provideKitchenWorkspaceTeam()

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
