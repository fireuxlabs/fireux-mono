<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <WorkspaceKitchenNav
        :state="team.state.value"
        :derived="team.derived.value"
      />
    </template>
    <template #body>
      <WorkspaceKitchenTeamSelector :team="team" />
      <WorkspaceHero
        title="Build your Kitchen Team"
        description="Review the people connected to this Kitchen and their Team roles."
      />
      <WorkspaceKitchenTeamAI :team="team" />
      <WorkspaceKitchenTeam :team="team" />
      <WorkspaceKitchenTeamTools :team="team" />
      <WorkspaceKitchenCapabilities />
      <WorkspaceKitchenTeamDiscovery />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const team = useKitchenWorkspaceTeam()
const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-team',
    label: 'Team',
    group: 'Workspace',
    description: 'Kitchen Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 6,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})

useAppLandingSeo({
  title: `Team | ${appName}`,
  description:
    'Review the people connected to this Kitchen and their Team roles.',
  path: '/workspace/kitchen/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
