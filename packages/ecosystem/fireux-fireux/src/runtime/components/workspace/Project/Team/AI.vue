<template>
  <WorkspaceProjectIntent
    label="Project Team"
    :scope-key="scopeKey"
    :available-actions="team.derived.value.capability.availableActions"
    :suggestions="suggestions"
    :request="requestAI"
    @action="openAction"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'
import type { ProjectTeamIntent } from 'fireux-core/runtime/project/models/team-intent'
import { useProjectIntent } from '../../../../project/composables/workspace/ai/useProjectIntent'
import type { ProjectIntent } from '../../../../project/models/intent'
const props = defineProps<{
  team: ReturnType<typeof useProjectWorkspaceTeam>
}>()
const emit = defineEmits<{ action: [intent: ProjectTeamIntent] }>()
const { request } = useProjectIntent()
const scopeKey = computed(() =>
  JSON.stringify([
    props.team.state.value.project.id,
    props.team.state.value.team.selectedTeamMemberId,
  ])
)
const examples = {
  create: 'Add a teammate named Alex',
  read: 'Who is on this Team?',
  update: 'Rename the selected member to Alex',
  delete: 'Deactivate the selected member',
}
const suggestions = computed(() =>
  props.team.derived.value.capability.availableActions.map((action) => ({
    label: examples[action],
  }))
)
function requestAI(prompt: string) {
  const state = props.team.state.value
  return request<ProjectTeamIntent>({
    capability: 'team',
    prompt,
    selectedId: state.team.selectedTeamMemberId,
    records: state.team.members
      .slice(0, 100)
      .map(({ id, name, role, jobTitle }) => ({ id, name, role, jobTitle })),
    availableActions: props.team.derived.value.capability.availableActions,
  })
}
function openAction(intent: ProjectIntent) {
  if (
    'name' in intent &&
    typeof intent.name === 'string' &&
    !('description' in intent)
  )
    emit('action', intent as ProjectTeamIntent)
}
</script>
