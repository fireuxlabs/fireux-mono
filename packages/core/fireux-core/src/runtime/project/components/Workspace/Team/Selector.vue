<template>
  <section
    class="flex items-center gap-2"
    aria-label="Project Team controls"
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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { useProjectWorkspaceTeam } from '../../../composables/workspace/team/useProjectWorkspaceTeam'

type Workspace = ReturnType<typeof useProjectWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const items = computed(() =>
  props.state.team.members.map((member) => ({
    label: String(member.display_name || member.handle || member.id).trim(),
    value: member.id,
  }))
)
</script>
