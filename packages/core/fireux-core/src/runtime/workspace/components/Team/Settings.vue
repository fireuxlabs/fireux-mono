<template>
  <UCard>
    <div class="space-y-5">
      <h2 class="font-medium">{{ member.name }}</h2>
      <WorkspaceTeamUpdateForm
        ref="form"
        :key="member.id"
        :member="member"
        :active="active"
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
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { onScopeDispose, ref } from 'vue'
import WorkspaceTeamUpdateForm from './UpdateForm.vue'
import type { WorkspaceTeamMember } from '../../composables/useWorkspaceTeam'
import type { WorkspaceCrudPrimitiveId } from '../../models/capability-context'
const props = defineProps<{
  active?: boolean
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
let disposed = false
onScopeDispose(() => {
  disposed = true
})
async function remove() {
  if (
    props.active === false ||
    deleting.value ||
    !props.available.includes('delete')
  )
    return
  const memberId = props.member.id
  deleting.value = true
  error.value = ''
  try {
    const result = await props.removeMember(memberId)
    if (disposed) return
    emit('removed')
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    if (disposed) return
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    deleting.value = false
  }
}
defineExpose({ prepare: (name: string) => form.value?.prepare(name) })
</script>
