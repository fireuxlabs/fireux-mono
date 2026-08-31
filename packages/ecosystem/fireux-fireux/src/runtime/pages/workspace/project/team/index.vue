<template>
  <UDashboardPanel id="workspace-project-team">
    <WorkspaceProjectNav :state="state" :derived="derived" />
    <WorkspaceProjectTeamSelector />
    <WorkspaceHero
      title="Build your Project Team"
      description="Review the people connected to this Project and their Team roles."
    />
    <WorkspaceProjectTeamAI />
    <WorkspaceProjectTeam />
    <WorkspaceProjectTeamTools />
    <WorkspaceProjectTeamDiscovery />
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTeam } from '../../../../project/composables/workspace/team/useProjectWorkspaceTeam'
import { appMeta } from '~/meta'

const { state, derived, actions } = useProjectWorkspaceTeam()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'project',
  workspaceSurface: 'browse',
  visibility: { ecosystems: ['fireux'] },
  nav: {
    key: 'workspace-project-team',
    label: 'Team',
    group: 'Workspace',
    description: 'Project Team',
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
    'Review the people connected to this Project and their Team roles.',
  path: '/workspace/project/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
