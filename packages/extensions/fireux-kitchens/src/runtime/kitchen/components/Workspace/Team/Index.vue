<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen Team"
  >
    <WorkspaceKitchenTeamCrud
      :state="state"
      :derived="derived"
      :actions="actions"
    />
    <WorkspaceKitchenTeamRead
      :members="teamMembers"
      :pending="pending"
      :inviting-member-id="invitingMemberId"
      @invite="inviteMember"
    />

    <UAlert
      v-if="!pending && !teamMembers.length"
      color="neutral"
      variant="subtle"
      icon="i-lucide-users"
      title="No team members yet"
      description="Add the first person to begin this Kitchen Team."
    />

    <UModal
      v-model:open="inviteOpen"
      :title="`Invite ${invitation?.memberName || 'member'}`"
      description="Anyone with this one-use link can claim this Kitchen member. It expires after seven days."
      :ui="{ content: 'sm:max-w-lg' }"
    >
      <template #body>
        <div v-if="invitation" class="space-y-4">
          <UInput :model-value="invitation.link" readonly class="w-full" />
          <div class="flex justify-end gap-2">
            <UButton
              label="Close"
              color="neutral"
              variant="ghost"
              @click="inviteOpen = false"
            />
            <UButton
              label="Copy invitation link"
              icon="i-lucide-copy"
              @click="copyInvitation"
            />
          </div>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceTeam'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const teamMembers = computed(() => props.state.team.members)
const pending = computed(() => props.derived.status === 'loading')
const toast = useToast()
const invitingMemberId = ref('')
const inviteOpen = ref(false)
const invitation = ref<{ memberName: string; link: string } | null>(null)

async function inviteMember(member: WorkspaceTeamMember) {
  if (invitingMemberId.value) return
  invitingMemberId.value = member.id
  try {
    invitation.value = await props.actions.createTeamMemberInvitation(member.id)
    inviteOpen.value = true
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
