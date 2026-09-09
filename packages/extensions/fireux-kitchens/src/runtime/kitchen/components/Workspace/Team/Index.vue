<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen Team"
  >
    <WorkspaceTeamEditor ref="crud" :team="team">
      <template #collection>
        <UAlert
          v-if="derived.status === 'error'"
          color="error"
          title="Team could not be loaded"
          description="Check your connection and try again."
        />
        <WorkspaceTeamPeople
          v-else
          :members="teamMembers"
          :role-labels="roleLabels"
          :selected-id="state.team.selectedTeamMemberId"
          @select="natives.select"
          :pending="pending"
        />
      </template>
      <template #selected>
        <WorkspaceTeamAssignment
          :editor="rolesEditor"
          :member-id="state.team.selectedTeamMemberId"
        />
        <UButton
          v-if="selected && !selected.userId"
          label="Copy invitation link"
          icon="i-lucide-link"
          variant="soft"
          :loading="invitingMemberId === selected.id"
          @click="inviteMember(selected)"
        />
        <UButton
          v-if="selected"
          :to="`/workspace/kitchen/team/${encodeURIComponent(selected.id)}`"
          label="More person details"
          variant="link"
          class="w-fit"
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
      :member-id="state.team.selectedTeamMemberId"
      :member-name="
        state.team.members.find(
          (member) => member.id === state.team.selectedTeamMemberId
        )?.name
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
import { computed, ref } from 'vue'
import WorkspaceTeamPeople from 'fireux-core/runtime/components/Workspace/Team/People.vue'
import WorkspaceTeamEditor from 'fireux-core/runtime/components/Workspace/Team/Editor.vue'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/useTeam'
import type { useKitchenTeam } from '../../../composables/workspace/team/useKitchenTeam'

type Workspace = ReturnType<typeof useKitchenTeam>

import WorkspaceTeamRoles from 'fireux-core/runtime/components/Workspace/Team/Roles.vue'
import WorkspaceTeamAssignment from 'fireux-core/runtime/components/Workspace/Team/Assignment.vue'

const props = defineProps<{
  team: Workspace
}>()
const { state, derived, natives } = props.team
const rolesEditor = ref<InstanceType<typeof WorkspaceTeamRoles>>()
const roleLabels = ref<Record<string, string[]>>({})

const crud = ref<InstanceType<typeof WorkspaceTeamEditor>>()
const selected = computed(() =>
  state.value.team.members.find(
    (member) => member.id === state.value.team.selectedTeamMemberId
  )
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
