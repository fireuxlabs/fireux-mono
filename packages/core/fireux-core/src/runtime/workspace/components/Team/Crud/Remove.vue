<template>
  <UModal
    v-model:open="open"
    :title="`Remove ${member?.name || 'team member'}?`"
    description="This removes the person from this Team’s roster."
    :dismissible="!deleting"
    :close="!deleting"
  >
    <template #body>
      <p v-if="error" role="alert">{{ error }}</p>
      <FireCopyError v-if="error" :message="error" />
      <div class="fx-card__actions">
        <UButton
          label="Cancel"
          color="neutral"
          variant="ghost"
          :disabled="deleting"
          @click="open = false"
        />
        <UButton
          label="Remove member"
          color="error"
          :loading="deleting"
          :disabled="!canRemove || deleting"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { computed, ref, watch } from 'vue'
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import type { TeamContext } from '../../../composables/useWorkspaceTeam'

const props = defineProps<{ team: TeamContext; memberId?: string }>()
const open = ref(false)
const deleting = ref(false)
const error = ref('')
const toast = useToast()
const workspaceId = computed(() => props.team.workspaceId.value)
const memberId = computed(
  () => props.memberId || props.team.state.value.team.selectedTeamMemberId
)
const member = computed(() =>
  props.team.state.value.team.members.find((row) => row.id === memberId.value)
)
const canRemove = computed(() =>
  Boolean(
    workspaceId.value &&
      member.value &&
      props.team.derived.value.capability.primitives.delete.available
  )
)
const scope = [() => props.team, workspaceId, memberId, canRemove]
const capture = useCommandScope([...scope, open])
watch(
  scope,
  () => {
    open.value = false
  },
  { flush: 'sync' }
)
watch(
  open,
  () => {
    deleting.value = false
    error.value = ''
  },
  { flush: 'sync' }
)

function prepare(id: string) {
  if (canRemove.value && member.value?.id === id) open.value = true
}

async function confirm() {
  if (!open.value || deleting.value || !canRemove.value) return
  const isCurrent = capture()
  deleting.value = true
  error.value = ''
  try {
    const result = await props.team.primitives.delete(memberId.value, isCurrent)
    if (!isCurrent()) return
    open.value = false
    toast.add({ title: `${result.name} removed`, color: 'success' })
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
defineExpose({ prepare })
</script>
