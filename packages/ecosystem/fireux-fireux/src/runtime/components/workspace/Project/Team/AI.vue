<template>
  <WorkspaceProjectIntent
    label="Project Team"
    :initial-prompt="initialPrompt"
    :scope-key="scopeKey"
    :available-actions="team.derived.value.capability.availableActions"
    :suggestions="suggestions"
    :request="requestAI"
    @action="openAction"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWorkspaceDraftHandoff } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDraftHandoff'
import type { useProjectTeam } from 'fireux-core/runtime/project/composables/useProjectTeam'
import type { ProjectTeamIntent } from 'fireux-core/runtime/project/models/team-intent'
import { useProjectIntent } from '../../../../project/composables/workspace/ai/useProjectIntent'
import type { ProjectIntent } from '../../../../project/models/intent'
const props = defineProps<{
  team: ReturnType<typeof useProjectTeam>
}>()
const handoff = useWorkspaceDraftHandoff()
const initialPrompt = ref('')
watch(
  () => props.team.state.value.project.id,
  (id: string) => {
    if (id) initialPrompt.value = handoff.take(`project:${id}:team`)
  },
  { immediate: true }
)
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
  delete: 'Remove the selected member',
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
      .map(({ id, name }) => ({ id, name })),
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
