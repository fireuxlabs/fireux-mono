<template>
  <section
    class="flex items-center gap-2"
    aria-label="Kitchen Team controls"
  >
    <UTabs
      v-if="items.length"
      :model-value="state.team.selectedTeamMemberId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="actions.selectTeamMember(String($event))"
    />

    <UButton
      v-if="derived.canCreateTeamMember"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Add Team member"
      title="Add Team member"
      @click="actions.openCreateTeamMember"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const items = computed(() =>
  props.state.team.members.map((member) => ({
    label: String(member.display_name || member.name || member.id).trim(),
    value: member.id,
  }))
)
</script>
