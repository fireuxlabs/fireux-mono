<template>
  <WorkspaceAI aria-label="Kitchen Team AI" compact>
    <p v-if="message" role="status" class="text-sm text-muted">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(prompt.trim() && !submitting)"
      :submitting="submitting"
      placeholder="Ask Kitchen Team AI…"
      aria-label="Ask Kitchen Team AI"
      :suggestions="suggestions"
      suggestions-aria-label="Available Team actions"
      @submit="submit"
      @select-suggestion="prompt = $event.label"
    />
  </WorkspaceAI>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useWorkspaceDraftHandoff } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDraftHandoff'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { useKitchenTeam } from '../../../composables/workspace/team/useKitchenTeam'
const props = defineProps<{
  team: ReturnType<typeof useKitchenTeam>
}>()
const emit = defineEmits<{ action: [intent: TeamAIIntent] }>()
const prompt = ref('')
const handoff = useWorkspaceDraftHandoff()
watch(
  () => props.team.state.value.kitchen.id,
  (id: string) => {
    const draft = id ? handoff.take(`kitchen:${id}:team`) : ''
    if (draft && !prompt.value) prompt.value = draft
  },
  { immediate: true }
)
const message = ref('')
const submitting = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
const examples = {
  create: 'Create a member named Alex',
  read: 'Show the Team members',
  update: 'Rename the selected member to Alex',
  delete: 'Remove the selected member',
}
const suggestions = computed(() =>
  props.team.derived.value.capability.availableActions
    .filter(
      (action) =>
        action !== 'update' ||
        !props.team.state.value.team.members.find(
          (member) =>
            member.id === props.team.state.value.team.selectedTeamMemberId
        )?.userId
    )
    .map((action) => ({
      id: action,
      label: examples[action],
    }))
)
async function submit() {
  if (!prompt.value.trim() || submitting.value) return
  const context = props.team.context.value
  const kitchenId = context.workspace.id
  const selectedId = context.selected?.id ?? ''
  submitting.value = true
  message.value = ''
  try {
    const user = await useRequireUser()
    const intent = await $fetch<TeamAIIntent>(
      '/api/workspace/kitchen/team/intent',
      {
        method: 'POST',
        timeout: 60_000,
        retry: 0,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          prompt: prompt.value.trim(),
          selectedId,
          records: context.collection.records.map(({ id, name, userId }) => ({
            id,
            name,
            linked: Boolean(userId),
          })),
          availableActions: context.derived.capability.availableActions,
        },
      }
    )
    if (!active) return
    if (
      kitchenId !== props.team.state.value.kitchen.id ||
      selectedId !== props.team.state.value.team.selectedTeamMemberId
    ) {
      message.value =
        'The selected workspace or member changed. Send your request again.'
      return
    }
    if (
      intent.action !== 'none' &&
      !props.team.derived.value.capability.primitives[intent.action].available
    ) {
      message.value = 'That action is no longer available.'
      return
    }
    message.value =
      intent.action === 'none'
        ? intent.message
        : 'Review the prepared dialog. Nothing has been changed yet.'
    if (intent.action !== 'none') emit('action', intent)
  } catch (cause) {
    message.value =
      cause instanceof Error
        ? cause.message
        : 'Team AI could not prepare that action. Try again.'
  } finally {
    submitting.value = false
  }
}
</script>
