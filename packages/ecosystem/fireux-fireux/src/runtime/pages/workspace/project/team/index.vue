<template>
  <UDashboardPanel id="workspace-project-team">
    <template #header>
      <WorkspaceProjectNav />
    </template>
    <template #body>
      <WorkspaceProjectTeamSelector :team="team" />
      <WorkspaceHero
        title="Build your Project Team"
        description="Review the people connected to this Project and their Team roles."
      />
      <WorkspaceProjectTeamAI :team="team" />
      <WorkspaceProjectTeam :team="team" />
      <WorkspaceProjectTeamTools />
      <WorkspaceProjectOperations />
      <WorkspaceProjectTeamDiscovery />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

const team = useProjectWorkspaceTeam()
const { appName } = useFireUXConfig()

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
  title: `Team | ${appName}`,
  description:
    'Review the people connected to this Project and their Team roles.',
  path: '/workspace/project/team',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
