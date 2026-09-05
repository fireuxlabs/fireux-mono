<template>
  <WorkspaceAI aria-label="Project Team AI" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      placeholder="Ask Project Team AI…"
      :suggestions="suggestions"
      :can-submit="Boolean(prompt.trim())"
      :submitting="false"
      suggestions-aria-label="Suggested Project actions"
      aria-label="Ask Project Team AI"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useProjectWorkspaceTeam } from 'fireux-core/runtime/project/composables/workspace/team/useProjectWorkspaceTeam'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
const props = defineProps<{
  team: ReturnType<typeof useProjectWorkspaceTeam>
}>()
const emit = defineEmits<{ action: [intent: TeamAIIntent] }>()
const prompt = ref('')
const message = ref('')
const examples = {
  create: 'Create a Team member',
  read: 'Read the Project Team',
  update: 'Update the selected member',
  delete: 'Deactivate the selected member',
}
const suggestions = computed(() =>
  props.team.derived.value.capability.availableActions.map((action) => ({
    label: examples[action],
  }))
)
function submit() {
  const request = prompt.value.trim()
  let action: TeamAIIntent['action'] = 'none'
  let name = ''
  const create = request.match(
    /^(?:add|create)(?: a)?(?: team)? member(?: (?:named|called) (.{1,120}))?[.!?]*$/iu
  )
  const rename = request.match(
    /^rename (?:the )?selected member to (.{1,120})$/iu
  )
  if (create) {
    action = 'create'
    name = create[1] || ''
  } else if (
    /^(?:read|show|list) (?:the )?(?:project )?team[.!?]*$/iu.test(request)
  )
    action = 'read'
  else if (rename) {
    action = 'update'
    name = rename[1] || ''
  } else if (/^update (?:the )?selected member[.!?]*$/iu.test(request))
    action = 'update'
  else if (
    /^(?:delete|deactivate) (?:the )?selected member[.!?]*$/iu.test(request)
  )
    action = 'delete'
  if (action === 'none') {
    message.value =
      'This page currently supports the prompt shortcuts shown below. Choose one to prepare its dialog.'
    return
  }
  if (!props.team.derived.value.capability.availableActions.includes(action)) {
    message.value = 'That action is not currently available.'
    return
  }
  emit('action', { action, name, message: '' })
  message.value = 'Review the prepared dialog. Nothing has been changed yet.'
}
</script>
