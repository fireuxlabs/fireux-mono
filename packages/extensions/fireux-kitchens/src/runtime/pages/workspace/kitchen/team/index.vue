<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <WorkspaceKitchenNav :state="state" :derived="derived" />
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
    <WorkspaceKitchenTeamTools
      :state="state"
      :derived="derived"
      :actions="actions"
    />
    <WorkspaceKitchenTeamDiscovery
      :state="state"
      :derived="derived"
      :actions="actions"
    />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'
import { appMeta } from '~/meta'

const { state, derived, actions } = useKitchenWorkspaceTeam()

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
  title: `Team | ${appMeta.name}`,
  description:
    'Review the people connected to this Kitchen and their Team roles.',
  path: '/workspace/kitchen/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
