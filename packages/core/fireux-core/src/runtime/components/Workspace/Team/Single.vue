<template>
  <section class="space-y-4" aria-label="Selected team member">
    <h2 class="font-semibold">
      {{ selectedMember?.name || 'Choose a person' }}
    </h2>
    <UCard v-if="selectedMember" aria-label="Edit selected team member">
      <div v-if="selectedMember" class="mb-4 flex items-center gap-3">
        <UAvatar
          :src="selectedMember.avatar || undefined"
          :alt="selectedMember.name"
          size="lg"
        />
        <div>
          <div class="flex items-center gap-1.5">
            <p class="font-semibold">{{ selectedMember.name }}</p>
            <UIcon
              v-if="selectedMember.userId"
              name="i-lucide-badge-check"
              class="size-4 text-primary"
              role="img"
              aria-label="Account linked"
              title="Account linked"
            />
          </div>
        </div>
      </div>
      <WorkspaceTeamUpdateForm
        ref="form"
        :key="selectedMember.id"
        :member="selectedMember"
        :available="available.includes('update')"
        :update-member="updateMember"
      />
      <div class="my-5 space-y-4"><slot /></div>
      <MoleculesCopyError v-if="error" :message="error" />
      <UButton
        label="Remove member"
        color="error"
        icon="i-lucide-user-minus"
        :loading="deleting"
        :disabled="!available.includes('delete')"
        @click="remove"
      />
    </UCard>
    <p v-else class="text-sm text-muted">
      Select a person to view their details.
    </p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceTeamUpdateForm from './UpdateForm.vue'
import type {
  TeamAIIntent,
  WorkspaceTeamMember,
} from '../../../composables/fireux/useTeam'
import type { WorkspaceCrudPrimitiveId } from '../../../composables/fireux/workspace/workspaceCapabilityContext'
const props = defineProps<{
  members: readonly WorkspaceTeamMember[]
  selectedMemberId: string
  available: WorkspaceCrudPrimitiveId[]
  updateMember: (input: { memberId: string; name: string }) => Promise<unknown>
  removeMember: (memberId: string) => Promise<{ name: string }>
}>()
const selectedMember = computed(() =>
  props.members.find((member) => member.id === props.selectedMemberId)
)
const form = ref<InstanceType<typeof WorkspaceTeamUpdateForm>>()
const deleting = ref(false)
const error = ref('')
const toast = useToast()
async function remove() {
  const member = selectedMember.value
  if (!member || deleting.value || !props.available.includes('delete')) return
  deleting.value = true
  error.value = ''
  try {
    const result = await props.removeMember(member.id)
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    deleting.value = false
  }
}
defineExpose({
  openAction: (intent: TeamAIIntent) => {
    if (intent.action === 'update' && props.available.includes('update'))
      form.value?.prepare(intent.name)
  },
})
</script>
