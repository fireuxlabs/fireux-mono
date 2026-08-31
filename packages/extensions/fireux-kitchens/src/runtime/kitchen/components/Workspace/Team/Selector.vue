<template>
  <section
    class="flex items-center gap-2"
    aria-label="Kitchen Team controls"
  >
    <UTabs
      v-if="items.length"
      v-model="selectedTeamMemberId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
    />

    <UButton
      v-if="canCreateTeamMember"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Add Team member"
      title="Add Team member"
      @click="addTeamMember"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenTeamContext } from '../../../composables/workspace/team/useKitchenTeamContext'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const {
  selectableTeamMembers,
  selectedTeamMemberId,
  canCreateTeamMember,
} = useKitchenTeamContext()
const { performAction } = useKitchenCapabilityTools('team')
const items = computed(() =>
  selectableTeamMembers.value.map((member) => ({
    label: String(member.display_name || member.name || member.id).trim(),
    value: member.id,
  }))
)
function addTeamMember() {
  if (canCreateTeamMember.value) {
    void performAction('kitchen.team.create-member')
  }
}
</script>
