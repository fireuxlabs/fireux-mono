<template>
  <UDashboardPanel id="workspace-kitchen-team">
    <template #header>
      <WorkspaceNavbar :title="intro.title">
        <template #right><WorkspaceIntroInfo :intro="liveIntro" /></template>
      </WorkspaceNavbar>
      <UDashboardToolbar :ui="{ root: 'border-b-0' }"
        ><UTabs
          v-if="team.state.value.team.members.length"
          :model-value="team.state.value.team.selectedTeamMemberId"
          :items="
            team.state.value.team.members.map((member) => ({
              label: member.name,
              value: member.id,
            }))
          "
          :content="false"
          variant="link"
          size="sm"
          aria-label="Select Team member"
          @update:model-value="team.natives.select(String($event))"
      /></UDashboardToolbar>
    </template>
    <template #body>
      <WorkspaceHero
        compact
        :title="intro.title"
        :description="intro.purpose"
      />
      <KitchenTeamAI :team="team" @action="teamView?.openAction($event)" />
      <KitchenTeam
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
import KitchenTeam from '../../../../kitchen/components/Team/Index.vue'
const teamView = ref<InstanceType<typeof KitchenTeam>>()
import WorkspaceFreemium from 'fireux-core/runtime/workspace/components/Freemium.vue'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'

import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useKitchenWorkspaceTeam } from '../../../../kitchen/composables/workspace/useKitchenWorkspaceTeam'

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
  ],
}))
const { appName } = useFireUXConfig()

definePageMeta({
  layout: 'workspace',
  pageTransition: false,
  workspace: 'kitchen',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: { hidden: true },
  requiresAuth: true,
  requiresSelection: true,
})

useAppLandingSeo({
  title: `Team | ${appName}`,
  description:
    'Review the people connected to this Kitchen and their Team roles.',
  path: '/workspace/kitchen/team/people',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
