<template>
  <UCard>
    <div class="workspace-surface workspace-surface--compact">
      <h2>{{ member.name }}</h2>
      <WorkspaceTeamUpdateForm
        ref="form"
        :key="member.id"
        :member="member"
        :active="active"
        :available="available.includes('update')"
        :update-member="updateMember"
      />
      <slot />
      <UButton
        label="Remove member"
        color="error"
        icon="i-lucide-user-minus"
        :disabled="active === false || !available.includes('delete')"
        @click="emit('request-remove', member.id)"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import WorkspaceTeamUpdateForm from './UpdateForm.vue'
import type { WorkspaceTeamMember } from '../../composables/useWorkspaceTeam'
import type { WorkspaceCrudPrimitiveId } from '../../models/capability-context'
const props = defineProps<{
  active?: boolean
  member: WorkspaceTeamMember
  available: WorkspaceCrudPrimitiveId[]
  updateMember: (input: { memberId: string; name: string }) => Promise<unknown>
}>()
const emit = defineEmits<{ 'request-remove': [memberId: string] }>()
const form = ref<InstanceType<typeof WorkspaceTeamUpdateForm>>()
defineExpose({ prepare: (name: string) => form.value?.prepare(name) })
</script>
