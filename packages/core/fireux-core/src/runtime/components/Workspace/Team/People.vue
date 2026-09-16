<template>
  <div class="workspace-team-people">
    <USelect
      v-if="!pending && sortedMembers.length"
      v-model="filter"
      :items="options"
      aria-label="Filter People by assigned role"
      class="w-full"
    />
    <p v-if="pending" role="status" class="fx-type-body">Loading people…</p>
    <div v-else class="workspace-team-people__rows">
      <WorkspaceSelectionRow
        v-for="member in filtered"
        :key="member.id"
        :id="`team-member-${member.id}`"
        :selected="selectedId === member.id"
        @select="emit('select', member.id)"
      >
        <UAvatar
          :src="member.avatar || undefined"
          :alt="member.name"
          :text="memberInitials(member)"
        />
        <span class="truncate">{{ member.name }}</span>
      </WorkspaceSelectionRow>
    </div>
    <p
      v-if="!pending && sortedMembers.length && !filtered.length"
      class="fx-type-caption"
    >
      No people match this role.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamPeopleFilter } from '../../../composables/fireux/workspace/useTeamPeopleFilter'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'

const props = withDefaults(
  defineProps<{
    roleLabels?: Record<string, string[]>
    members?: readonly WorkspaceTeamMember[]
    selectedId?: string
    pending?: boolean
  }>(),
  {
    members: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  select: [id: string]
}>()

const memberInitials = (member: WorkspaceTeamMember) =>
  member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
const sortedMembers = computed(() =>
  props.members
    .map((member) => ({
      ...member,
      organisationRoles: props.roleLabels?.[member.id] || [],
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
)
const { filter, options, filtered } = useTeamPeopleFilter(sortedMembers)
</script>

<style scoped>
.workspace-team-people {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.workspace-team-people__rows {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}
</style>
