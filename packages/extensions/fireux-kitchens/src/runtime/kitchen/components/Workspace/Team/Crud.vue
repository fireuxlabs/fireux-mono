<template>
  <div>
    <WorkspaceCrudToolbar
      label="Kitchen Team"
      :available="available"
      @create="createOpen = true"
      @read="actions.refresh"
      @update="selectedMember && editMember(selectedMember)"
      @delete="selectedMember && confirmDeleteMember(selectedMember)"
    />

    <WorkspaceKitchenTeamCrudCreate
      v-model:open="createOpen"
      :state="state"
      :derived="derived"
    />

    <UModal
      v-model:open="editOpen"
      title="Edit team member"
      description="Update the person’s name and Kitchen responsibility. Account linking remains separate."
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
          <UFormField label="Responsibility">
            <USelect
              v-model="editRole"
              :items="roleItems"
              value-key="value"
              label-key="label"
              :disabled="editingMember?.role === 'owner'"
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
      :title="`Deactivate ${deletingMember?.display_name || deletingMember?.name || 'team member'}?`"
      description="This revokes linked Kitchen access and pending invitations while preserving the member’s operational history."
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
            label="Deactivate member"
            color="error"
            icon="i-lucide-user-minus"
            :loading="Boolean(deletingMemberId)"
            @click="deleteMember"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { useKitchenWorkspaceTeam } from '../../../composables/workspace/team/useKitchenWorkspaceTeam'
import type { KitchenTeamMember } from '../../../utils/team.ts'

type Workspace = ReturnType<typeof useKitchenWorkspaceTeam>

const props = defineProps<{
  state: Workspace['state']['value']
  derived: Workspace['derived']['value']
  actions: Workspace['actions']
}>()

const teamMembers = computed(() => props.state.team.members)
const selectedMember = computed(() =>
  teamMembers.value.find(
    (member) => member.id === props.state.team.selectedTeamMemberId
  )
)
const available = computed<Array<'create' | 'read' | 'update' | 'delete'>>(
  () => [
    ...(props.derived.canCreateTeamMember ? (['create'] as const) : []),
    ...(props.derived.hasSelection ? (['read'] as const) : []),
    ...(selectedMember.value ? (['update'] as const) : []),
    ...(selectedMember.value?.role !== 'owner' && selectedMember.value
      ? (['delete'] as const)
      : []),
  ]
)
const toast = useToast()
const createRequested = ref(false)
const createOpen = computed({
  get: () =>
    createRequested.value ||
    props.state.team.activeToolId === 'kitchen.team.create-member',
  set: (open: boolean) => {
    createRequested.value = open
    if (
      !open &&
      props.state.team.activeToolId === 'kitchen.team.create-member'
    ) {
      props.actions.closeCreateTeamMember()
    }
  },
})
const editOpen = ref(false)
const editingMember = ref<KitchenTeamMember | null>(null)
const editName = ref('')
const editRole = ref<'owner' | 'operator' | 'member'>('member')
const roleItems = [
  { label: 'Team member', value: 'member' },
  { label: 'Operator', value: 'operator' },
] as const
const editError = ref('')
const savingMember = ref(false)
const deleteOpen = ref(false)
const deletingMember = ref<KitchenTeamMember | null>(null)
const deletingMemberId = ref('')

function editMember(member: KitchenTeamMember) {
  editingMember.value = member
  editName.value = String(member.display_name || member.name || '').trim()
  editRole.value = member.role || 'member'
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
    await props.actions.updateTeamMember({
      memberId: member.id,
      name,
      ...(editRole.value === 'owner' ? {} : { role: editRole.value }),
    })
    editOpen.value = false
    toast.add({ title: `${name} updated`, color: 'success' })
  } catch (error) {
    editError.value = error instanceof Error ? error.message : 'Try again.'
  } finally {
    savingMember.value = false
  }
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
    const result = await props.actions.deactivateTeamMember(member.id)
    deleteOpen.value = false
    deletingMember.value = null
    toast.add({ title: `${result.name} deactivated`, color: 'success' })
  } catch (error) {
    toast.add({
      title: 'Team member could not be deactivated',
      description: error instanceof Error ? error.message : 'Try again.',
      color: 'error',
    })
  } finally {
    deletingMemberId.value = ''
  }
}
</script>
