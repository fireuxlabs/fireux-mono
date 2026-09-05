<template>
  <UDashboardPanel id="workspace-project-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceProjectTeamSelector :team="team" />
      <WorkspaceFreemium
        family="project"
        capability="team"
        page-label="Team"
        placement="top"
      />
      <WorkspaceHero :title="intro.title" :description="intro.purpose" />
      <WorkspaceProjectTeamAI :team="team" />

      <WorkspaceProjectTeam :team="team" />
      <WorkspaceProjectTeamTools />
      <WorkspaceProjectTeamDiscovery />
      <WorkspaceFreemium
        family="project"
        capability="team"
        page-label="Team"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'

const intro = {
  title: 'Project Team',
  purpose:
    'Manage the people and access associated with this project workspace.',
  data: 'Team members, invitations and their supported access details.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits.',
  ai: 'Ask about the Team and its available tools. Supported actions follow the same authority as the human controls.',
}

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
