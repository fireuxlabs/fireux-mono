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
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useAppSession } from '../../../app/composables/useAppSession'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { ref, watch } from 'vue'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import type { WorkspaceTeamMember } from '../../../composables/fireux/useTeam'
const props = defineProps<{
  active?: boolean
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
const { currentUser } = useAuth()
const appSession = useAppSession()
const fireux = useFireUXConfig()
const authoritySources = [currentUser, appSession.appUser, () => fireux.appId]
const captureCommand = useCommandScope([...authoritySources, name, () => props.member.id, () => props.member.name, () => props.available, () => props.active])
watch([...authoritySources, name, () => props.member.id, () => props.available, () => props.active], () => { saving.value = false; error.value = '' }, { flush: 'sync' })
async function save() {
  if (props.active === false || saving.value || !props.available) return
  const value = name.value.trim().replace(/\s+/g, ' ')
  if (!value) {
    error.value = 'Enter a name.'
    return
  }
  const isCurrent = captureCommand()
  const memberId = props.member.id
  saving.value = true
  error.value = ''
  try {
    await props.updateMember({ memberId, name: value })
    if (!isCurrent()) return
    toast.add({ title: `${value} updated`, color: 'success' })
  } catch (cause) {
    if (!isCurrent()) return
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (isCurrent()) saving.value = false
  }
}
defineExpose({
  prepare: (value: string) => {
    if (value) name.value = value
  },
})
</script>
