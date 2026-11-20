<template>
  <section class="kitchen-people">
    <WorkspacePageHeader
      title="People"
      description="Manage the people in this kitchen and their responsibilities."
      variant="child"
    />
    <People.Collection
      :key="team.state.value.kitchen.id"
      ref="teamView"
      :team="team"
    />
    <details class="kitchen-record-assistant">
      <summary>Ask KitchenAI about your team</summary>
      <People.Ai :team="team" @action="teamView?.openAction($event)" />
    </details>
    <WorkspaceIntroInfo :intro="liveIntro" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TeamAIIntent } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import WorkspaceIntroInfo from 'fireux-core/runtime/workspace/components/IntroInfo.vue'
import * as People from './index'
import { useKitchenWorkspaceTeam } from '../../../../composables/workspace/useKitchenWorkspaceTeam'
import { kitchenTeamAgentTools } from '../../../../tools/team'

const teamView = ref<{ openAction: (intent: TeamAIIntent) => void }>()
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
</script>

<style scoped>
@import '../../record-tools.css';

.kitchen-people {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
</style>
