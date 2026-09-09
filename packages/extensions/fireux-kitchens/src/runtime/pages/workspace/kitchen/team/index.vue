<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <LayoutsWorkspaceNavbar :title="intro.title">
        <template #right><WorkspaceIntroInfo :intro="liveIntro" /></template>
      </LayoutsWorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"><UTabs
          v-if="team.state.value.team.members.length"
          :model-value="team.state.value.team.selectedTeamMemberId"
          :items="team.state.value.team.members.map(member => ({ label: member.name, value: member.id }))"
          :content="false" variant="link" size="sm" aria-label="Select Team member"
          @update:model-value="team.natives.select(String($event))"
        /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero compact :title="intro.title" :description="intro.purpose" />
      <WorkspaceKitchenTeamAI
        :team="team"
        @action="teamView?.openAction($event)"
      />
      <WorkspaceKitchenTeam
        :key="team.state.value.kitchen.id"
        ref="teamView"
        :team="team"
      />
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
import WorkspaceKitchenTeam from '../../../../kitchen/components/Workspace/Team/Index.vue'
const teamView = ref<InstanceType<typeof WorkspaceKitchenTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/components/Workspace/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/components/Workspace/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenTeam } from '../../../../kitchen/composables/workspace/team/useKitchenTeam'

import { kitchenTeamAgentTools } from '../../../../kitchen/tools/team'

const primitiveLabels: Record<string, string> = {
  'create-member': 'Create',
  'read-members': 'Read',
  'update-member': 'Update',
  'delete-member': 'Delete — remove',
}
const intro = {
  title: 'Kitchen Team',
  purpose: 'Add people to your team, update their details and assign roles.',
  data: 'People, optional linked accounts, assigned workspace roles.',
  boundaries:
    'Team changes follow the selected workspace’s membership authority and subscription limits. Creating a member focuses their live record; Read changes local focus without changing membership.',
  tools: kitchenTeamAgentTools
    .filter((tool) => primitiveLabels[tool.id.replace('kitchen.team.', '')])
    .map((tool) => ({
      id: tool.id,
      label: primitiveLabels[tool.id.replace('kitchen.team.', '')]!,
      description: `${tool.context.instruction} ${tool.context.outcome}`,
    })),
  ai: 'AI prepares the same Team controls used on this page. Review and confirm changes yourself.',
}

const team = useKitchenTeam()
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
    group: '',
    description: 'Kitchen Team',
    icon: 'i-lucide-users',
    position: 'top',
    order: 60,
    prominent: false,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
    children: [{ label: 'People', to: '/workspace/kitchen/team' }, { label: 'Responsibilities', to: '/workspace/kitchen/team#responsibilities' }],
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
