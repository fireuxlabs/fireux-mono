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
import { computed, ref, watch } from 'vue'
import type { WorkspaceTeamMember } from '../../composables/useWorkspaceTeam'

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
const filter = ref('all')
const options = computed(() => {
  const counts = new Map<string, number>()
  for (const member of sortedMembers.value) {
    const labels = [...new Set(member.organisationRoles)]
    for (const label of labels.length ? labels : [''])
      counts.set(label, (counts.get(label) || 0) + 1)
  }
  return [
    { label: `All people (${sortedMembers.value.length})`, value: 'all' },
    ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({
      label: `${label || 'No assigned role'} (${count})`,
      value: `role:${label}`,
    })),
  ]
})
watch(options, (items) => {
  if (!items.some((item) => item.value === filter.value)) filter.value = 'all'
})
const filtered = computed(() => sortedMembers.value.filter((member) =>
  filter.value === 'all' || (filter.value === 'role:'
    ? !member.organisationRoles.length
    : member.organisationRoles.includes(filter.value.slice(5)))
))
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
