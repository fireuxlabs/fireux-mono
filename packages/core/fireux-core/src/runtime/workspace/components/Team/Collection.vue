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
      class="w-full"
    />
    <div class="grid min-w-0 gap-2">
      <WorkspaceSelectionRow
        v-for="member in visibleItems"
        :key="member.id"
        :selected="member.id === state.team.selectedTeamMemberId"
        @select="team.natives.select(member.id)"
      >
        <UAvatar
          :src="member.avatar || undefined"
          :alt="member.name"
          icon="i-lucide-user"
        />
        <span class="truncate">{{ member.name }}</span>
      </WorkspaceSelectionRow>
    </div>
    <p
      v-if="query && !visibleItems.length"
      class="text-sm text-muted"
      role="status"
    >
      No team members match this search.
    </p>
  </WorkspaceEntityCollection>
  <WorkspaceTeamCrudCreate
    v-model:open="createOpen"
    :initial-name="createName"
    :create="primitives.create"
    :available="available"
  />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { TeamContext } from '../../composables/useWorkspaceTeam'
import type { WorkspaceOutcome } from '../../models/outcome'
const props = defineProps<{
  title?: string
  error?: string
  roleLabels?: Record<string, string[]>
  team: TeamContext
}>()
const { state, derived, primitives } = props.team
const members = computed(() =>
  [...state.value.team.members].sort((a, b) => a.name.localeCompare(b.name))
)
const outcome = computed<WorkspaceOutcome>(() => {
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
