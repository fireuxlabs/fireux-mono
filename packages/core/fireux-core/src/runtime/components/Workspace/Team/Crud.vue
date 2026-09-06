<template>
  <div>
    <div v-if="!openPlan" class="flex flex-wrap gap-4">
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
          @delete="selectedMember && confirmRemove(selectedMember)"
        />
      </div>
    </div>

    <WorkspaceTeamCrudRead
      v-if="!openPlan"
      v-model:open="readOpen"
      :label="label"
      :members="members"
      :route-base="routeBase"
      @select="emit('select', $event)"
    />

    <WorkspaceTeamDialog
      v-model:open="editOpen"
      :bare="openPlan"
      :title="openPlan ? undefined : 'Edit team member'"
      :description="openPlan ? undefined : updateDescription"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <div v-if="editingMember" class="mb-4 flex items-center gap-3">
          <UAvatar
            :src="editingMember.avatar || undefined"
            :alt="editingMember.name"
            size="lg"
          />
          <div>
            <div class="flex items-center gap-1.5">
              <p class="font-semibold">{{ editingMember.name }}</p>
              <UIcon
                v-if="editingMember.userId"
                name="i-lucide-badge-check"
                class="size-4 text-primary"
                role="img"
                aria-label="Account linked"
                title="Account linked"
              />
            </div>
          </div>
        </div>
        <form
          v-if="editingMember && !editingMember.userId"
          class="space-y-5"
          @submit.prevent="saveMember"
        >
          <UFormField
            v-if="!editingMember?.userId"
            label="Name"
            :error="editError || undefined"
          >
            <UInput
              v-model="editName"
              :readonly="!!editingMember?.userId"
              name="name"
              autocomplete="off"
              maxlength="120"
              :autofocus="!openPlan"
              class="w-full"
            />
          </UFormField>
          <MoleculesCopyError v-if="editError" :message="editError" />
          <slot name="edit-fields" />
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
              :loading="saving"
              :disabled="!available.includes('update')"
            />
          </div>
        </form>
      </template>
    </WorkspaceTeamDialog>

    <slot name="member-tools" />
    <WorkspaceTeamDialog
      v-model:open="deleteOpen"
      :bare="openPlan"
      :title="`Remove ${deletingMember?.name || 'team member'}?`"
      :description="deleteDescription"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <UAlert
          v-if="deleteError"
          color="error"
          title="Member could not be removed"
          :description="deleteError"
        />
        <MoleculesCopyError v-if="deleteError" :message="deleteError" />
        <div class="flex justify-end gap-2">
          <UButton
            v-if="!openPlan"
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="deleteOpen = false"
          />
          <UButton
            label="Remove member"
            color="error"
            icon="i-lucide-user-minus"
            :loading="deleting"
            :disabled="!available.includes('delete')"
            @click="removeMember"
          />
        </div>
      </template>
    </WorkspaceTeamDialog>
  </div>
</template>

<script setup lang="ts">
import WorkspaceTeamDialog from './Dialog.vue'
import { computed, inject, ref, watch } from 'vue'
import type { WorkspaceCrudPrimitiveId } from '../../../composables/fireux/workspace/workspaceCapabilityContext'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'

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
  }) => Promise<unknown>
  removeMember: (memberId: string) => Promise<{ name: string }>
}>()

const emit = defineEmits<{
  (event: 'edit', memberId: string): void
  (event: 'create'): void
  (event: 'select', id: string): void
}>()
defineExpose({ openAction })
function openAction(
  intent: import('../../../composables/fireux/useTeam').TeamAIIntent
) {
  if (intent.action === 'none' || !props.available.includes(intent.action))
    return
  if (intent.action === 'read') readOpen.value = true
  if (intent.action === 'update' && selectedMember.value) {
    editMember(selectedMember.value)
    if (intent.name) editName.value = intent.name
  }
  if (intent.action === 'delete' && selectedMember.value)
    confirmRemove(selectedMember.value)
}
const openPlan = inject('workspace-team-open-plan', false)
const readOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const editingMember = ref<WorkspaceTeamMember | null>(null)
const deletingMember = ref<WorkspaceTeamMember | null>(null)
const editName = ref('')
const editError = ref('')
const deleteError = ref('')
const saving = ref(false)
const deleting = ref(false)
const toast = useToast()
const selectedMember = computed(() =>
  props.members.find((member) => member.id === props.selectedMemberId)
)

watch(
  selectedMember,
  (member: WorkspaceTeamMember | undefined) => {
    if (!openPlan) return
    if (member) {
      editMember(member)
      confirmRemove(member)
    } else {
      editingMember.value = null
      deletingMember.value = null
    }
  },
  { immediate: true }
)

function editMember(member: WorkspaceTeamMember) {
  emit('edit', member.id)
  editingMember.value = member
  editName.value = member.name
  editError.value = ''
  editOpen.value = true
}

async function saveMember() {
  if (saving.value) return
  const member = editingMember.value
  const name = (member?.userId ? member.name : editName.value)
    .trim()
    .replace(/\s+/g, ' ')
  if (!member || !name) {
    editError.value = 'Enter a name.'
    return
  }
  if (
    !props.available.includes('update') ||
    props.selectedMemberId !== member.id ||
    !props.members.some((item) => item.id === member.id)
  ) {
    editError.value =
      'This member can no longer be updated. Close this dialog and review the Team.'
    return
  }
  saving.value = true
  editError.value = ''
  try {
    await props.updateMember({
      memberId: member.id,
      name,
    })
    editOpen.value = false
    toast.add({ title: `${name} updated`, color: 'success' })
  } catch (cause) {
    editError.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    saving.value = false
  }
}

function confirmRemove(member: WorkspaceTeamMember) {
  deleteError.value = ''
  deletingMember.value = member
  deleteOpen.value = true
}

async function removeMember() {
  const member = deletingMember.value
  if (!member || deleting.value) return
  if (
    !props.available.includes('delete') ||
    props.selectedMemberId !== member.id ||
    !props.members.some((item) => item.id === member.id)
  ) {
    deleteError.value =
      'This member can no longer be removed. Close this dialog and review the Team.'
    return
  }
  deleting.value = true
  deleteError.value = ''
  try {
    const result = await props.removeMember(member.id)
    deleteOpen.value = false
    deletingMember.value = null
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    deleteError.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    deleting.value = false
  }
}
</script>
