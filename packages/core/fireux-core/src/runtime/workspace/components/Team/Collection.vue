<template>
  <WorkspaceEntityCollection
    :outcome="outcome"
    :count="members.length"
    entity="team members"
    :title="title || 'Team'"
    :error-description="
      error || 'Team could not be loaded. Check your connection and try again.'
    "
    empty-title="No team members yet"
    empty-description="Add the first person to begin."
    layout="list"
  >
    <template #actions>
      <UButton
        v-if="!readOnly"
        icon="i-lucide-plus"
        label="Add person"
        :disabled="!available"
        @click="openCreate()"
      />
    </template>
    <UInput
      v-model="query"
      icon="i-lucide-search"
      placeholder="Search team members…"
      aria-label="Search team members by name or role"
    />
    <div>
      <WorkspaceSelectionRow
        v-for="member in visibleItems"
        :key="member.id"
        :selected="member.id === state.team.selectedTeamMemberId"
        :to="memberPath?.(member.id)"
        @select="select(member.id)"
      >
        <UAvatar
          :src="member.avatar || undefined"
          :alt="member.name"
          icon="i-lucide-user"
        />
        <span>{{ member.name }}</span>
      </WorkspaceSelectionRow>
    </div>
    <p v-if="query && !visibleItems.length" role="status">
      No team members match this search.
    </p>
  </WorkspaceEntityCollection>
  <WorkspaceTeamCrudCreate
    v-if="!readOnly"
    v-model:open="createOpen"
    :initial-name="createName"
    :create="primitives.create"
    :available="available"
  />
</template>
<script setup lang="ts">
import type { ReadOutcome } from '../../../utils/read-outcome'
import { computed, ref } from 'vue'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { TeamContext } from '../../composables/useWorkspaceTeam'
const props = defineProps<{
  readOnly?: boolean
  memberPath?: (memberId: string) => string
  title?: string
  error?: string
  roleLabels?: Record<string, string[]>
  team: TeamContext
}>()
const emit = defineEmits<{ select: [memberId: string] }>()
function select(memberId: string) {
  props.team.natives.select(memberId)
  emit('select', memberId)
}
const { state, derived, primitives } = props.team
const members = computed(() =>
  [...state.value.team.members].sort((a, b) => a.name.localeCompare(b.name))
)
const outcome = computed<ReadOutcome>(() => {
  const status = derived.value.status
  if (status === 'loading') return 'pending'
  if (status === 'error') return 'error'
  if (status === 'empty') return 'idle'
  return members.value.length ? 'ready' : 'empty'
})
const { query, visibleItems } = useCollectionSearch({
  items: members,
  makeCard: (member) => member,
  searchText: (member) =>
    [member.name, member.userId, ...(props.roleLabels?.[member.id] || [])]
      .join(' ')
      .toLowerCase(),
})
const available = computed(
  () => derived.value.capability.primitives.create.available
)
const createOpen = ref(false)
const createName = ref('')
function openCreate(name = '') {
  if (!available.value) return
  createName.value = name
  createOpen.value = true
}
defineExpose({ openCreate })
</script>
