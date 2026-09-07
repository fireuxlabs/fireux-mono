<template>
  <form
    v-if="member && !member.userId"
    class="space-y-5"
    @submit.prevent="save"
  >
    <UFormField v-if="!member?.userId" label="Name" :error="error || undefined">
      <UInput
        v-model="name"
        :readonly="!!member?.userId"
        name="name"
        autocomplete="off"
        maxlength="120"
        :autofocus="false"
        class="w-full"
      />
    </UFormField>
    <MoleculesCopyError v-if="error" :message="error" />
    <slot name="edit-fields" />
    <div class="flex justify-end gap-2">
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        type="button"
        @click="name = member.name"
      />
      <UButton
        label="Save changes"
        type="submit"
        :loading="saving"
        :disabled="!available"
      />
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'
const props = defineProps<{
  member: WorkspaceTeamMember
  available: boolean
  updateMember: (input: { memberId: string; name: string }) => Promise<unknown>
}>()
const name = ref(props.member.name)
const error = ref('')
const saving = ref(false)
const toast = useToast()
watch(
  () => [props.member.id, props.member.name],
  () => {
    name.value = props.member.name
    error.value = ''
  }
)
async function save() {
  if (saving.value || !props.available) return
  const value = name.value.trim().replace(/\s+/g, ' ')
  if (!value) {
    error.value = 'Enter a name.'
    return
  }
  const memberId = props.member.id
  saving.value = true
  error.value = ''
  try {
    await props.updateMember({ memberId, name: value })
    toast.add({ title: `${value} updated`, color: 'success' })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    saving.value = false
  }
}
defineExpose({
  prepare: (value: string) => {
    if (value) name.value = value
  },
})
</script>
