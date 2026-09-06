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
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { KitchenTeamIntent } from '../../../models/team-onboarding'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'
const props = defineProps<{
  team: ReturnType<typeof useKitchenWorkspaceTeam>
}>()
const emit = defineEmits<{ action: [intent: KitchenTeamIntent] }>()
const prompt = ref('')
const message = ref('')
const submitting = ref(false)
let active = true
onBeforeUnmount(() => {
  active = false
})
const examples = {
  onboard: 'Onboard a teammate named Alex',
  create: 'Create a member named Alex',
  read: 'Show the Team members',
  update: 'Rename the selected member to Alex',
  delete: 'Deactivate the selected member',
}
const suggestions = computed(() =>
  [
    ...props.team.derived.value.capability.availableActions,
    ...(props.team.derived.value.capability.primitives.create.available
      ? ['onboard' as const]
      : []),
  ].map((action) => ({
    id: action,
    label: examples[action],
  }))
)
async function submit() {
  if (!prompt.value.trim() || submitting.value) return
  const state = props.team.state.value
  const kitchenId = state.kitchen.id
  const selectedId = state.team.selectedTeamMemberId
  submitting.value = true
  message.value = ''
  try {
    const user = await useRequireUser()
    const intent = await $fetch<KitchenTeamIntent>(
      '/api/workspace/kitchen/team/intent',
      {
        method: 'POST',
        timeout: 60_000,
        retry: 0,
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
        body: {
          prompt: prompt.value.trim(),
          selectedId,
          records: state.team.members.map(({ id, name, role, jobTitle }) => ({
            id,
            name,
            role,
            jobTitle,
          })),
          availableActions: [
            ...props.team.derived.value.capability.availableActions,
            ...(props.team.derived.value.capability.primitives.create.available
              ? ['onboard']
              : []),
          ],
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
      !props.team.derived.value.capability.primitives[
        intent.action === 'onboard' ? 'create' : intent.action
      ].available
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
