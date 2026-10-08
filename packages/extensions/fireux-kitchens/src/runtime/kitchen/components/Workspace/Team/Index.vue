<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen Team"
  >
    <WorkspaceTeamEditor
      :role-labels="roleLabels"
      :title="collectionTitle"
      ref="crud"
      :team="team"
      :member-id="memberId"
      :single-path="selectedPath"
    >
      <template #collection>
        <UAlert
          v-if="derived.status === 'error'"
          color="error"
          title="Team could not be loaded"
          description="Check your connection and try again."
        ><template #actions><MoleculesCopyError message="Team could not be loaded. Check your connection and try again." /></template></UAlert>
        <WorkspaceTeamPeople
          v-else
          :members="teamMembers"
          :role-labels="roleLabels"
          :selected-id="selectedId"
          @select="natives.select"
          :pending="pending"
        />
      </template>
      <template #single>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="selectedId"
        />
        <UButton
          v-if="selected && !selected.userId"
          label="Copy invitation link"
          icon="i-lucide-link"
          variant="soft"
          :loading="invitingMemberId === selected.id"
          @click="inviteMember(selected)"
        />
      </template>
    </WorkspaceTeamEditor>

    <UAlert
      v-if="!pending && derived.status !== 'error' && !teamMembers.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-users"
      title="No team members yet"
      description="Add the first person to begin this Kitchen Team."
    />
    <WorkspaceTeamRoles
      id="responsibilities"
      ref="rolesEditor"
      class="rounded-xl border border-default p-4"
      compact
      :workspace-name="state.kitchen.name"
      @labels="roleLabels = $event"
      v-if="derived.status === 'ready'"
      :workspace-id="state.kitchen.id"
      :member-id="selectedId"
      :member-name="
        state.team.members.find((member) => member.id === selectedId)?.name
      "
      endpoint="/api/workspace/kitchen/team/roles"
      :suggestions="[
        'Owner',
        'Head Chef',
        'Sous Chef',
        'Commis',
        'Kitchen Porter',
      ]"
    />
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
const workspaceIdentity = useKitchenWorkspacePlace()
const collectionTitle = computed(() =>
  workspaceIdentity.place.value?.name
    ? `${workspaceIdentity.place.value.name}’s Team`
    : 'Team'
)

import { computed, ref } from 'vue'
import { useToast } from '#imports'
import WorkspaceTeamPeople from 'fireux-core/runtime/components/Workspace/Team/People.vue'
import WorkspaceTeamEditor from 'fireux-core/runtime/components/Workspace/Team/Editor.vue'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { useKitchenTeam } from '../../../composables/team/useKitchenTeam'

type Workspace = ReturnType<typeof useKitchenTeam>

import WorkspaceTeamRoles from 'fireux-core/runtime/components/Workspace/Team/Roles.vue'
import WorkspaceTeamAssignment from 'fireux-core/runtime/components/Workspace/Team/Assignment.vue'

const props = defineProps<{
  memberId?: string
  team: Workspace
}>()
const { state, derived, natives } = props.team
const selectedId = computed(
  () => props.memberId || state.value.team.selectedTeamMemberId
)
const selectedPath = computed(
  () => `/workspace/kitchen/team/${encodeURIComponent(selectedId.value)}`
)

const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})

const crud = ref<InstanceType<typeof WorkspaceTeamEditor>>()
const selected = computed(() =>
  state.value.team.members.find((member) => member.id === selectedId.value)
)
defineExpose({
  openAction: (intent: TeamAIIntent) => crud.value?.openAction(intent),
})
const teamMembers = computed(() => state.value.team.members)
const pending = computed(() => derived.value.status === 'loading')
const toast = useToast()
const invitingMemberId = ref('')
const invitation = ref<{ memberName: string; link: string } | null>(null)

async function inviteMember(member: WorkspaceTeamMember) {
  if (invitingMemberId.value) return
  invitingMemberId.value = member.id
  try {
    invitation.value = await natives.invite(member.id)
    await navigator.clipboard.writeText(invitation.value.link)
    toast.add({ title: 'Invitation link copied', color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Invitation could not be created',
      description: error instanceof Error ? error.message : 'Try again.',
      color: 'error',
    })
  } finally {
    invitingMemberId.value = ''
  }
}
</script>
