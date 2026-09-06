<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title"
        ><template #right><WorkspaceIntroInfo :intro="liveIntro" /></template
      ></LayoutsWorkspaceNavbar>
    </template>
    <template #body>
      <div class="flex items-start justify-between gap-3">
        <WorkspaceKitchenTeamSelector class="min-w-0 flex-1" :team="team" />
        <WorkspaceFreemium
          beside-selector
          family="kitchen"
          capability="team"
          :used-count="team.state.value.team.members.length"
          page-label="Team"
          placement="top"
        />
      </div>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <WorkspaceKitchenTeamAI :team="team" @action="openAction" />

      <WorkspaceKitchenTeam ref="teamView" :team="team" />
      <WorkspaceKitchenTeamTools :team="team" @onboard="onboard?.show()" />
      <WorkspaceKitchenTeamOnboard ref="onboard" :team="team" />
      <WorkspaceKitchenTeamDiscovery />
      <WorkspaceFreemium
        family="kitchen"
        capability="team"
        :used-count="team.state.value.team.members.length"
        page-label="Team"
        placement="bottom"
      />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceKitchenTeamOnboard from '../../../../kitchen/components/Workspace/Team/Onboard.vue'
import {
  kitchenTeamOnboarding,
  type KitchenTeamIntent,
} from '../../../../kitchen/models/team-onboarding'
const onboard = ref<InstanceType<typeof WorkspaceKitchenTeamOnboard>>()
function openAction(intent: KitchenTeamIntent) {
  if (intent.action === 'onboard') onboard.value?.show(intent.name)
  else teamView.value?.openAction({ ...intent, action: intent.action })
}
import WorkspaceKitchenTeam from '../../../../kitchen/components/Workspace/Team/Index.vue'
const teamView = ref<InstanceType<typeof WorkspaceKitchenTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/team/useKitchenWorkspaceTeam'

import { kitchenTeamAgentTools } from '../../../../kitchen/tools/team'

const primitiveLabels: Record<string, string> = {
  'create-member': 'Create',
  'read-members': 'Read',
  'update-member': 'Update',
  'delete-member': 'Delete — deactivate',
}
const intro = {
  title: 'Kitchen Team',
  purpose:
    'Manage the people and access associated with this kitchen workspace.',
  data: 'Team members, optional free-text job titles, invitations and supported access details. Job titles do not grant permissions.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits. Creating a member focuses their live record; Read changes local focus without changing membership.',
  tools: kitchenTeamAgentTools
    .filter((tool) => primitiveLabels[tool.id.replace('kitchen.team.', '')])
    .map((tool) => ({
      id: tool.id,
      label: primitiveLabels[tool.id.replace('kitchen.team.', '')]!,
      description: `${tool.context.instruction} ${tool.context.outcome}`,
    })),
  ai: 'AI prepares the same Create, Read, Update and Deactivate dialogs as the human controls. Review and confirm changes yourself.',
}

const team = useKitchenWorkspaceTeam()
const liveIntro = computed(() => ({
  ...intro,
  status: team.derived.value.status,
  recordCount: team.state.value.team.members.length,
  tools: [
    ...intro.tools.map((tool) => ({
      ...tool,
      available: team.derived.value.capability.availableActions.includes(
        tool.id
          .replace('kitchen.team.', '')
          .replace('-members', '')
          .replace('-member', '') as 'create' | 'read' | 'update' | 'delete'
      ),
    })),
    {
      id: kitchenTeamOnboarding.id,
      label: kitchenTeamOnboarding.label,
      description: kitchenTeamOnboarding.context,
      available: team.derived.value.capability.primitives.create.available,
    },
  ],
}))
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
