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
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useAppSession } from '../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { ref, watch } from 'vue'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import WorkspaceTeamUpdateForm from './UpdateForm.vue'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'
import type { WorkspaceCrudPrimitiveId } from '../../../composables/fireux/workspace/workspaceCapabilityContext'
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
const { currentUser } = useAuth()
const appSession = useAppSession()
const fireux = useFireUXConfig()
const authoritySources = [currentUser, appSession.appUser, () => fireux.appId]
const captureCommand = useCommandScope([...authoritySources, () => props.member.id, () => props.available.join('|'), () => props.active])
watch([...authoritySources, () => props.member.id, () => props.available.join('|'), () => props.active], () => { deleting.value = false; error.value = '' }, { flush: 'sync' })
async function remove() {
  if (props.active === false || deleting.value || !props.available.includes('delete')) return
  const isCurrent = captureCommand()
  const memberId = props.member.id
  deleting.value = true
  error.value = ''
  try {
    const result = await props.removeMember(memberId)
    if (!isCurrent()) return
    emit('removed')
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    if (!isCurrent()) return
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
defineExpose({ prepare: (name: string) => form.value?.prepare(name) })
</script>
