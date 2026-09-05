<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="intro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <WorkspaceKitchenTeamSelector :team="team" />
      <WorkspaceFreemium
        family="kitchen"
        capability="team"
        page-label="Team"
        placement="top"
      />
      <WorkspaceHero :title="intro.title" :description="intro.purpose" />
      <WorkspaceKitchenTeamAI :team="team" />

      <WorkspaceKitchenTeam :team="team" />
      <WorkspaceKitchenTeamTools :team="team" />
      <WorkspaceKitchenTeamDiscovery />
      <WorkspaceFreemium
        family="kitchen"
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
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

const intro = {
  title: 'Kitchen Team',
  purpose:
    'Manage the people and access associated with this kitchen workspace.',
  data: 'Team members, invitations and their supported access details.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits.',
  ai: 'Ask about the Team and its available tools. Supported actions follow the same authority as the human controls.',
}

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
