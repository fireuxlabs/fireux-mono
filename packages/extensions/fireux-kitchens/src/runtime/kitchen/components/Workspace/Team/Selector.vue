<template>
  <section
    class="flex items-center gap-2"
    aria-label="Kitchen Team controls"
  >
    <USelect
      v-if="items.length"
      v-model="selectedTeamMemberId"
      :items="items"
      value-key="value"
      aria-label="Select Team member"
      class="min-w-0 flex-1 sm:max-w-72"
    />

    <UButton
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Add Team member"
      :title="createTitle"
      :disabled="!canCreateTeamMember"
      @click="addTeamMember"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const {
  selectableTeamMembers,
  selectedTeamMemberId,
  canCreateTeamMember,
  teamMemberCapacityReached,
  teamMemberLimit,
} = useKitchenWorkspaceTeam()
const { performAction } = useKitchenCapabilityTools('team')
const items = computed(() =>
  selectableTeamMembers.value.map((member) => ({
    label: String(member.display_name || member.name || member.id).trim(),
    value: member.id,
  }))
)
const createTitle = computed(() =>
  teamMemberCapacityReached.value
    ? `This plan supports up to ${teamMemberLimit.value} Team members.`
    : 'Add Team member'
)

function addTeamMember() {
  if (canCreateTeamMember.value) {
    void performAction('kitchen.team.create-member')
  }
}
</script>
