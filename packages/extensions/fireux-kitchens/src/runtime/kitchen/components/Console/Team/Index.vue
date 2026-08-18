<template>
  <section>
    <ConsoleKitchenTeamRead
      :members="teamMembers"
      :pending="pending"
      :inviting-member-id="invitingMemberId"
      :deleting-member-id="deletingMemberId"
      @edit="editMember"
      @invite="inviteMember"
      @delete="confirmDeleteMember"
    />

    <UModal
      v-model:open="editOpen"
      title="Edit team member"
      description="Update the name shown in this Kitchen. Their link and account connection stay the same."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="saveMember">
          <UFormField label="Name" :error="editError || undefined">
            <UInput
              v-model="editName"
              name="name"
              autocomplete="off"
              maxlength="120"
              autofocus
              class="w-full"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              type="button"
              @click="editOpen = false"
            />
            <UButton
              label="Save changes"
              type="submit"
              :loading="savingMember"
            />
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="`Delete ${deletingMember?.display_name || deletingMember?.name || 'team member'}?`"
      description="This removes the named member and revokes their pending invitations. It cannot be undone."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="deleteOpen = false"
          />
          <UButton
            label="Delete member"
            color="error"
            icon="i-lucide-trash-2"
            :loading="Boolean(deletingMemberId)"
            @click="deleteMember"
          />
        </div>
      </template>
    </UModal>

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

    <DevDebugPanel
      title="Kitchen team"
      scope="console"
      object-origin="fetched"
      :objects="{ teamMembers, joinRequests }"
      :derived="debug"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenConsoleTeam } from '../../../composables/console/team/useKitchenConsoleTeam'
import { useKitchenMemberInvitationCreate } from '../../../composables/console/team/mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberUpdate } from '../../../composables/console/team/mutations/useKitchenTeamMemberUpdate'
import { useKitchenTeamMemberDelete } from '../../../composables/console/team/mutations/useKitchenTeamMemberDelete'
import type { KitchenTeamMember } from '../../../models/team.model.ts'

const { teamMembers, joinRequests, pending, debug, kitchenId } =
  useKitchenConsoleTeam()
const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()
const toast = useToast()
const editOpen = ref(false)
const editingMember = ref<KitchenTeamMember | null>(null)
const editName = ref('')
const editError = ref('')
const savingMember = ref(false)
const invitingMemberId = ref('')
const inviteOpen = ref(false)
const invitation = ref<{ memberName: string; link: string } | null>(null)
const deleteOpen = ref(false)
const deletingMember = ref<KitchenTeamMember | null>(null)
const deletingMemberId = ref('')

function editMember(member: KitchenTeamMember) {
  editingMember.value = member
  editName.value = String(member.display_name || member.name || '').trim()
  editError.value = ''
  editOpen.value = true
}

async function saveMember() {
  const member = editingMember.value
  const name = editName.value.trim().replace(/\s+/g, ' ')
  if (!member) return
  if (!name) {
    editError.value = 'Enter a name.'
    return
  }
  savingMember.value = true
  editError.value = ''
  try {
    await updateKitchenTeamMember({
      kitchenId: kitchenId.value,
      memberId: member.id,
      changes: { name },
    })
    editOpen.value = false
    toast.add({ title: `${name} updated`, color: 'success' })
  } catch (error) {
    editError.value = error instanceof Error ? error.message : 'Try again.'
  } finally {
    savingMember.value = false
  }
}

async function inviteMember(member: KitchenTeamMember) {
  if (invitingMemberId.value) return
  invitingMemberId.value = member.id
  try {
    invitation.value = await createKitchenMemberInvitation({
      kitchenId: kitchenId.value,
      memberId: member.id,
    })
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

function confirmDeleteMember(member: KitchenTeamMember) {
  deletingMember.value = member
  deleteOpen.value = true
}

async function deleteMember() {
  const member = deletingMember.value
  if (!member || deletingMemberId.value) return
  deletingMemberId.value = member.id
  try {
    const result = await deleteKitchenTeamMember(kitchenId.value, member.id)
    deleteOpen.value = false
    deletingMember.value = null
    toast.add({ title: `${result.name} deleted`, color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Team member could not be deleted',
      description: error instanceof Error ? error.message : 'Try again.',
      color: 'error',
    })
  } finally {
    deletingMemberId.value = ''
  }
}
</script>
