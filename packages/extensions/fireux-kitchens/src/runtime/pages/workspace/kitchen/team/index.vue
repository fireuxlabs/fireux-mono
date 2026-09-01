<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <WorkspaceKitchenNav :state="state" :derived="derived" />
    </template>
    <template #body>
      <WorkspaceKitchenTeamSelector
        :state="state"
        :derived="derived"
        :actions="actions"
      />
      <WorkspaceHero
        title="Build your Kitchen Team"
        description="Review the people connected to this Kitchen and their Team roles."
      />
      <WorkspaceKitchenTeamAI
        :state="state"
        :derived="derived"
        :actions="actions"
      />
      <WorkspaceKitchenTeam
        :state="state"
        :derived="derived"
        :actions="actions"
      />
      <WorkspaceKitchenTeamTools :derived="derived" :actions="actions" />
      <WorkspaceKitchenOperations />
      <WorkspaceKitchenTeamDiscovery
        :state="state"
        :derived="derived"
        :actions="actions"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const { state, derived, actions } = useKitchenWorkspaceTeam()
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
