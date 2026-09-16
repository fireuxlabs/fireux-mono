<template>
  <UCard>
    <div class="space-y-5">
      <h2 class="font-medium">{{ member.name }}</h2>
      <WorkspaceTeamUpdateForm
        ref="form"
        :key="member.id"
        :member="member"
        :available="available.includes('update')"
        :update-member="updateMember"
      />
      <slot />
      <MoleculesCopyError v-if="error" :message="error" />
      <UButton
        label="Remove member"
        color="error"
        icon="i-lucide-user-minus"
        :loading="deleting"
        :disabled="!available.includes('delete')"
        @click="remove"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamUpdateForm from './UpdateForm.vue'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'
import type { WorkspaceCrudPrimitiveId } from '../../../composables/fireux/workspace/workspaceCapabilityContext'
const props = defineProps<{
  member: WorkspaceTeamMember
  available: WorkspaceCrudPrimitiveId[]
  updateMember: (input: { memberId: string; name: string }) => Promise<unknown>
  removeMember: (memberId: string) => Promise<{ name: string }>
}>()
const emit = defineEmits<{ removed: [] }>()
const form = ref<InstanceType<typeof WorkspaceTeamUpdateForm>>()
const deleting = ref(false)
const error = ref('')
const toast = useToast()
async function remove() {
  if (deleting.value || !props.available.includes('delete')) return
  deleting.value = true
  error.value = ''
  try {
    const result = await props.removeMember(props.member.id)
    emit('removed')
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    deleting.value = false
  }
}
defineExpose({ prepare: (name: string) => form.value?.prepare(name) })
</script>
