<template>
  <section
    class="workspace-surface workspace-surface--compact"
    aria-label="Kitchen Team"
  >
    <UCard>
      <template #header
        ><WorkspaceKitchenTeamCrud ref="crud" :team="team"
      /></template>
      <div v-if="selected" class="flex items-center gap-3">
        <UAvatar
          :src="selected.avatar || undefined"
          :alt="selected.name"
          size="lg"
        />
        <div class="min-w-0">
          <p class="text-xs text-muted">Selected member</p>
          <h2 class="text-xl font-semibold">{{ selected.name }}</h2>
          <p class="text-sm text-muted">
            {{ selected.role }} ·
            {{ selected.userId ? 'Account linked' : 'Unlinked person' }}
          </p>
        </div>
        <UButton
          :to="`/workspace/kitchen/team/${encodeURIComponent(selected.id)}`"
          label="Details"
          color="neutral"
          variant="ghost"
          class="ml-auto"
        />
      </div>
      <p v-else class="text-sm text-muted">
        {{ pending ? 'Loading Team…' : 'Choose a member or create one.' }}
      </p>
    </UCard>
    <UAlert
      v-if="derived.status === 'error'"
      color="error"
      title="Team could not be loaded"
      description="Check your connection and try again."
    />
    <WorkspaceKitchenTeamRead
      v-else
      :members="teamMembers"
      :selected-id="state.team.selectedTeamMemberId"
      @select="natives.select"
      :pending="pending"
      :inviting-member-id="invitingMemberId"
      @invite="inviteMember"
    />

    <UAlert
      v-if="!pending && derived.status !== 'error' && !teamMembers.length"
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
import WorkspaceKitchenTeamCrud from './Crud.vue'
import type { TeamAIIntent } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { WorkspaceTeamMember } from 'fireux-core/runtime/composables/fireux/workspace/useTeam'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{ team: Workspace }>()
const { state, derived, natives } = props.team

const crud = ref<InstanceType<typeof WorkspaceKitchenTeamCrud>>()
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
const inviteOpen = ref(false)
const invitation = ref<{ memberName: string; link: string } | null>(null)

async function inviteMember(member: WorkspaceTeamMember) {
  if (invitingMemberId.value) return
  invitingMemberId.value = member.id
  try {
    invitation.value = await natives.invite(member.id)
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
