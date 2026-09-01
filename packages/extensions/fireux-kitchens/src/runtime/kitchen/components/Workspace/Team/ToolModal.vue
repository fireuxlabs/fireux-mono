<template>
  <UModal
    :open="open"
    :title="tool.title"
    :description="tool.description"
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div v-if="invitation" class="space-y-4">
        <UInput :model-value="invitation.link" readonly class="w-full" />
        <div class="flex justify-end gap-2">
          <UButton
            label="Close"
            color="neutral"
            variant="ghost"
            @click="emit('update:open', false)"
          />
          <UButton
            label="Copy invitation link"
            icon="i-lucide-copy"
            @click="copyInvitation"
          />
        </div>
      </div>

      <div v-else-if="selectedMember && confirmingDelete" class="space-y-5">
        <SelectedMember :member="selectedMember" @change="clearSelection" />
        <UAlert
          color="error"
          variant="soft"
          title="Deactivate this member?"
          description="This revokes linked Kitchen access and pending invitations while preserving operational history."
        />
        <div class="flex justify-end gap-2">
          <UButton
            label="Keep member"
            color="neutral"
            variant="ghost"
            @click="confirmingDelete = false"
          />
          <UButton
            label="Deactivate member"
            color="error"
            icon="i-lucide-user-minus"
            :loading="working"
            @click="deleteMember"
          />
        </div>
      </div>

      <form
        v-else-if="selectedMember && mode === 'update'"
        class="space-y-5"
        @submit.prevent="updateMember"
      >
        <SelectedMember :member="selectedMember" @change="clearSelection" />
        <UFormField label="Name" :error="error || undefined">
          <UInput
            v-model="name"
            autofocus
            autocomplete="off"
            maxlength="120"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Responsibility">
          <USelect
            v-model="role"
            :items="roleItems"
            value-key="value"
            label-key="label"
            :disabled="selectedMember.role === 'owner'"
            class="w-full"
          />
        </UFormField>
        <div class="flex items-center justify-between gap-2">
          <UButton
            v-if="selectedMember.role !== 'owner'"
            label="Deactivate member"
            icon="i-lucide-user-minus"
            color="error"
            variant="ghost"
            type="button"
            @click="confirmingDelete = true"
          />
          <span v-else />
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              type="button"
              @click="emit('update:open', false)"
            />
            <UButton label="Save changes" type="submit" :loading="working" />
          </div>
        </div>
      </form>

      <div v-else class="space-y-3">
        <p class="text-sm font-medium text-highlighted">Select a member</p>
        <button
          v-for="member in selectableMembers"
          :key="member.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-lg border border-default p-3 text-left transition-colors hover:bg-elevated"
          @click="selectMember(member)"
        >
          <UAvatar :alt="memberName(member)" :text="initials(member)" />
          <span class="min-w-0 flex-1 truncate text-sm font-medium">
            {{ memberName(member) }}
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted" />
        </button>
        <UAlert
          v-if="!selectableMembers.length"
          title="No eligible members"
          :description="emptyDescription"
          color="neutral"
          variant="soft"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SelectedMember from './SelectedMember.vue'
import type { KitchenTeamMember } from '../../../utils/team.ts'
import { useKitchenTeamContext } from '../../../composables/workspace/team/useKitchenTeamContext'
import { useKitchenMemberInvitationCreate } from '../../../composables/workspace/team/mutations/useKitchenMemberInvitationCreate'
import { useKitchenTeamMemberDelete } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberDelete'
import { useKitchenTeamMemberUpdate } from '../../../composables/workspace/team/mutations/useKitchenTeamMemberUpdate'

type TeamToolMode = 'update' | 'delete' | 'invite'

const props = defineProps<{ open: boolean; mode: TeamToolMode }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const { teamMembers, kitchenId } = useKitchenTeamContext()
const { createKitchenMemberInvitation } = useKitchenMemberInvitationCreate()
const { deleteKitchenTeamMember } = useKitchenTeamMemberDelete()
const { updateKitchenTeamMember } = useKitchenTeamMemberUpdate()
const toast = useToast()
const selectedMember = ref<KitchenTeamMember | null>(null)
const name = ref('')
const role = ref<'owner' | 'operator' | 'member'>('member')
const roleItems = [
  { label: 'Team member', value: 'member' },
  { label: 'Operator', value: 'operator' },
]
const error = ref('')
const working = ref(false)
const invitation = ref<{ memberName: string; link: string } | null>(null)
const confirmingDelete = ref(false)

const tools = {
  update: {
    title: 'Update a member',
    description: 'Select a Team member to update.',
  },
  delete: {
    title: 'Deactivate a member',
    description: 'Select a Team member to deactivate and revoke access.',
  },
  invite: {
    title: 'Create an invitation',
    description: 'Select an unlinked member and create a one-use invitation.',
  },
} as const

const tool = computed(() => tools[props.mode])
const activeMembers = computed(() =>
  teamMembers.value.filter(
    (member) => member.active !== false && member.status !== 'inactive'
  )
)
const selectableMembers = computed(() =>
  props.mode === 'invite'
    ? activeMembers.value.filter((member) => !member.user_id)
    : props.mode === 'delete'
      ? activeMembers.value.filter((member) => member.role !== 'owner')
      : activeMembers.value
)
const emptyDescription = computed(() =>
  props.mode === 'invite'
    ? 'Every current member is linked to an account.'
    : props.mode === 'delete'
      ? 'There are no eligible members to deactivate.'
      : 'Add a member before using this tool.'
)
const memberName = (member: KitchenTeamMember) =>
  String(member.display_name || member.name || 'Team member').trim()
const initials = (member: KitchenTeamMember) =>
  memberName(member)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

function clearSelection() {
  selectedMember.value = null
  name.value = ''
  role.value = 'member'
  error.value = ''
  confirmingDelete.value = false
}

function selectMember(member: KitchenTeamMember) {
  selectedMember.value = member
  name.value = memberName(member)
  role.value = member.role || 'member'
  if (props.mode === 'invite') void createInvitation()
  if (props.mode === 'delete') confirmingDelete.value = true
}

async function updateMember() {
  if (!selectedMember.value || working.value) return
  const normalizedName = name.value.trim().replace(/\s+/g, ' ')
  if (!normalizedName) {
    error.value = 'Enter a name.'
    return
  }
  working.value = true
  try {
    await updateKitchenTeamMember({
      kitchenId: kitchenId.value,
      memberId: selectedMember.value.id,
      changes: {
        name: normalizedName,
        ...(role.value === 'owner' ? {} : { role: role.value }),
      },
    })
    toast.add({ title: `${normalizedName} updated`, color: 'success' })
    emit('update:open', false)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    working.value = false
  }
}

async function createInvitation() {
  if (!selectedMember.value || working.value) return
  working.value = true
  try {
    invitation.value = await createKitchenMemberInvitation({
      kitchenId: kitchenId.value,
      memberId: selectedMember.value.id,
    })
  } catch (cause) {
    toast.add({
      title: 'Invitation could not be created',
      description: cause instanceof Error ? cause.message : 'Try again.',
      color: 'error',
    })
    clearSelection()
  } finally {
    working.value = false
  }
}

async function deleteMember() {
  if (!selectedMember.value || working.value) return
  working.value = true
  try {
    const result = await deleteKitchenTeamMember(
      kitchenId.value,
      selectedMember.value.id
    )
    toast.add({ title: `${result.name} deactivated`, color: 'success' })
    emit('update:open', false)
  } catch (cause) {
    toast.add({
      title: 'Team member could not be deactivated',
      description: cause instanceof Error ? cause.message : 'Try again.',
      color: 'error',
    })
  } finally {
    working.value = false
  }
}

async function copyInvitation() {
  if (!invitation.value) return
  await navigator.clipboard.writeText(invitation.value.link)
  toast.add({ title: 'Invitation link copied', color: 'success' })
}

watch(
  () => [props.open, props.mode] as const,
  () => {
    if (!props.open) return
    clearSelection()
    invitation.value = null
  }
)
</script>
