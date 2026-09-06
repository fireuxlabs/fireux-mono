<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen Team"
  >
    <WorkspaceKitchenTeamCrud ref="crud" :team="team">
      <template #collection>
        <UAlert
          v-if="derived.status === 'error'"
          color="error"
          title="Team could not be loaded"
          description="Check your connection and try again."
        />
        <WorkspaceKitchenTeamRead
          v-else
          :members="teamMembers"
          :role-labels="roleLabels"
          :selected-id="state.team.selectedTeamMemberId"
          @select="natives.select"
          :pending="pending"
          :inviting-member-id="invitingMemberId"
          @invite="inviteMember"
        />
      </template>
      <template #selected>
        <slot name="person-roles" />
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
    </WorkspaceKitchenTeamCrud>

    <UAlert
      v-if="!pending && derived.status !== 'error' && !teamMembers.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-users"
      title="No team members yet"
      description="Add the first person to begin this Kitchen Team."
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceKitchenTeamCrud from './Crud.vue'
import type { TeamAIIntent as KitchenTeamIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  team: Workspace
  roleLabels?: Record<string, string[]>
}>()
const { state, derived, natives } = props.team

const crud = ref<InstanceType<typeof WorkspaceKitchenTeamCrud>>()
const selected = computed(() =>
  state.value.team.members.find(
    (member) => member.id === state.value.team.selectedTeamMemberId
  )
)
defineExpose({
  openAction: (intent: KitchenTeamIntent) => crud.value?.openAction(intent),
})
const teamMembers = computed(() => state.value.team.members)
const pending = computed(() => derived.value.status === 'loading')
const toast = useToast()
const invitingMemberId = ref('')
const inviteOpen = ref(false)
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

async function copyInvitation() {
  if (!invitation.value) return
  await navigator.clipboard.writeText(invitation.value.link)
  toast.add({ title: 'Invitation link copied', color: 'success' })
}
</script>
