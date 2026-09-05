<template>
  <div>
    <div class="flex flex-wrap gap-4">
      <div class="space-y-2">
        <p class="text-xs text-muted">Collection</p>
        <WorkspaceCrudToolbar
          :label="`${label} collection`"
          :actions="['create', 'read']"
          :available="available"
          @create="emit('create')"
          @read="readOpen = true"
        />
      </div>
      <div class="space-y-2">
        <p class="text-xs text-muted">Selected member</p>
        <WorkspaceCrudToolbar
          :label="`${label} selected member`"
          :actions="['update', 'delete']"
          :available="available"
          @update="selectedMember && editMember(selectedMember)"
          @delete="selectedMember && confirmDeactivate(selectedMember)"
        />
      </div>
    </div>

    <WorkspaceTeamCrudRead
      v-model:open="readOpen"
      :label="label"
      :members="members"
      :route-base="routeBase"
      @select="emit('select', $event)"
    />

    <UModal
      v-model:open="editOpen"
      title="Edit team member"
      :description="updateDescription"
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
            <UButton label="Save changes" type="submit" :loading="saving" />
          </div>
        </form>
      </template>
    </UModal>

    <UModal
      v-model:open="deleteOpen"
      :title="`Deactivate ${deletingMember?.name || 'team member'}?`"
      :description="deleteDescription"
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
            :loading="deleting"
            @click="deactivateMember"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkspaceCrudPrimitiveId } from '../../../composables/fireux/workspace/workspaceCapabilityContext'
import type { WorkspaceTeamMember } from '../../../composables/fireux/workspace/useTeam'

const props = defineProps<{
  label: string
  members: readonly WorkspaceTeamMember[]
  selectedMemberId: string
  available: WorkspaceCrudPrimitiveId[]
  routeBase: string
  updateDescription: string
  deleteDescription: string
  updateMember: (input: {
    memberId: string
    name: string
    role?: 'operator' | 'member'
  }) => Promise<unknown>
  deactivateMember: (memberId: string) => Promise<{ name: string }>
}>()

const emit = defineEmits<{
  (event: 'create'): void
  (event: 'select', id: string): void
}>()
defineExpose({ openAction })
function openAction(
  intent: import('../../../composables/fireux/workspace/useTeam').TeamAIIntent
) {
  if (intent.action === 'none' || !props.available.includes(intent.action))
    return
  if (intent.action === 'read') readOpen.value = true
  if (intent.action === 'update' && selectedMember.value) {
    editMember(selectedMember.value)
    if (intent.name) editName.value = intent.name
    if (intent.role && selectedMember.value.role !== 'owner')
      editRole.value = intent.role
  }
  if (intent.action === 'delete' && selectedMember.value)
    confirmDeactivate(selectedMember.value)
}
const readOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const editingMember = ref<WorkspaceTeamMember | null>(null)
const deletingMember = ref<WorkspaceTeamMember | null>(null)
const editName = ref('')
const editRole = ref<'owner' | 'operator' | 'member'>('member')
const editError = ref('')
const saving = ref(false)
const deleting = ref(false)
const toast = useToast()
const roleItems = [
  { label: 'Team member', value: 'member' },
  { label: 'Operator', value: 'operator' },
]
const selectedMember = computed(() =>
  props.members.find((member) => member.id === props.selectedMemberId)
)

function editMember(member: WorkspaceTeamMember) {
  editingMember.value = member
  editName.value = member.name
  editRole.value = member.role || 'member'
  editError.value = ''
  editOpen.value = true
}

async function saveMember() {
  if (saving.value) return
  const member = editingMember.value
  const name = editName.value.trim().replace(/\s+/g, ' ')
  if (!member || !name) {
    editError.value = 'Enter a name.'
    return
  }
  saving.value = true
  editError.value = ''
  try {
    await props.updateMember({
      memberId: member.id,
      name,
      ...(editRole.value === 'owner' ? {} : { role: editRole.value }),
    })
    editOpen.value = false
    toast.add({ title: `${name} updated`, color: 'success' })
  } catch (cause) {
    editError.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    saving.value = false
  }
}

function confirmDeactivate(member: WorkspaceTeamMember) {
  deletingMember.value = member
  deleteOpen.value = true
}

async function deactivateMember() {
  const member = deletingMember.value
  if (!member || deleting.value) return
  deleting.value = true
  try {
    const result = await props.deactivateMember(member.id)
    deleteOpen.value = false
    deletingMember.value = null
    toast.add({ title: `${result.name} deactivated`, color: 'success' })
  } catch (cause) {
    toast.add({
      title: 'Team member could not be deactivated',
      description: cause instanceof Error ? cause.message : 'Try again.',
      color: 'error',
    })
  } finally {
    deleting.value = false
  }
}
</script>
