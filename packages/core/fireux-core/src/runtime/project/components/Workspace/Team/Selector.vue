<template>
  <section
    class="flex items-center gap-2"
    aria-label="Project Team controls"
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
      v-if="canAddTeamMember"
      icon="i-lucide-plus"
      color="neutral"
      variant="ghost"
      aria-label="Add Team member"
      title="Project Team changes are not available yet."
      disabled
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectTeamContext } from '../../../composables/workspace/team/useProjectTeamContext'

const { members, selectedTeamMemberId, canAddTeamMember } =
  useProjectTeamContext()
const items = computed(() =>
  members.value.map((member) => ({
    label: String(member.display_name || member.handle || member.id).trim(),
    value: member.id,
  }))
)
</script>
