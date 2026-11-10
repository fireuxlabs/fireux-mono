<template>
  <WorkspaceAI aria-label="Kitchen Team AI" compact>
    <p v-if="message" role="status">{{ message }}</p>
    <WorkspaceAIComposer
      v-model="prompt"
      :can-submit="Boolean(prompt.trim() && suggestions.length && !submitting)"
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
import { useRoute } from '#imports'
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceDraftHandoff } from 'fireux-core/runtime/workspace/composables/useWorkspaceDraftHandoff'
import { teamIntentRecords } from 'fireux-core/runtime/workspace/utils/team-intent-records'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { TeamAIIntent } from 'fireux-core/runtime/workspace/composables/useWorkspaceTeam'
import type { useKitchenWorkspaceTeam } from '../../composables/workspace/useKitchenWorkspaceTeam'
const props = defineProps<{
  team: ReturnType<typeof useKitchenWorkspaceTeam>
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
const { currentUser } = useAuth()
const route = useRoute()
const scope = [
  () => currentUser.value?.uid,
  () => route.fullPath,
  () => props.team.workspaceId.value,
  () => props.team.state.value.team.selectedTeamMemberId,
  () => props.team.derived.value.capability.availableActions.join('|'),
]
const capture = useCommandScope(scope)
watch(
  scope,
  () => {
    message.value = submitting.value
      ? 'The Team context changed. Send your request again.'
      : ''
    submitting.value = false
  },
  { flush: 'sync' }
)
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
  if (!prompt.value.trim() || submitting.value || !suggestions.value.length)
    return
  const isCurrent = capture()
  const uid = currentUser.value?.uid
  const context = props.team.context.value
  const selectedId = context.selected?.id ?? ''
  const body = {
    prompt: prompt.value.trim(),
    selectedId,
    records: teamIntentRecords(context.collection.records, selectedId).map(
      ({ id, name, userId }) => ({
        id,
        name,
        linked: Boolean(userId),
      })
    ),
    availableActions: [...context.derived.capability.availableActions],
  }
  submitting.value = true
  message.value = ''
  try {
    const user = await useRequireUser()
    if (!isCurrent() || user.uid !== uid) return
    const token = await user.getIdToken()
    if (!isCurrent()) return
    const intent = await $fetch<TeamAIIntent>(
      '/api/workspace/kitchen/team/intent',
      {
        method: 'POST',
        timeout: 60_000,
        retry: 0,
        headers: { authorization: `Bearer ${token}` },
        body,
      }
    )
    if (!isCurrent()) return
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
    if (isCurrent())
      message.value =
        cause instanceof Error
          ? cause.message
          : 'Team AI could not prepare that action. Try again.'
  } finally {
    if (isCurrent()) submitting.value = false
  }
}
</script>
