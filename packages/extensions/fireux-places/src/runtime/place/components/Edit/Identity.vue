<template>
  <UModal
    v-model:open="open"
    title="Edit venue identity"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <form class="space-y-5" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            v-for="field in placeIdentityFields"
            :key="field.key"
            :label="field.label"
            :required="field.key === 'name'"
          >
            <UInput
              v-model="draft[field.key]"
              :maxlength="field.max"
              :disabled="saving"
              class="w-full"
            />
          </UFormField>
        </div>
        <UAlert
          v-if="error"
          :description="error"
          title="Could not save identity"
          color="error"
        >
          <template #actions><MoleculesCopyError :message="error" /></template>
        </UAlert>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            :disabled="saving"
            @click="open = false"
          />
          <UButton
            label="Save changes"
            type="submit"
            :loading="saving"
            :disabled="!canWrite || !dirty"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Place } from '../../models/place.model'
import {
  identityDraft,
  readPlaceIdentity,
  placeIdentityFields,
  placeIdentityPatch,
  type PlaceIdentityProposal,
} from '../../models/identity-edit'
import {
  usePlaceUpdate,
  type PlaceMutationAuthority,
} from '../../composables/firestore/mutations/usePlaceUpdate'
const props = defineProps<{
  place: Place | null
  canWrite: boolean
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const emit = defineEmits<{ saved: [] }>()
const open = ref(false),
  saving = ref(false),
  error = ref(''),
  targetId = ref('')
const original = ref(readPlaceIdentity(null))
const draft = ref(readPlaceIdentity(null))
const originalSignature = ref('')
const dirty = computed(
  () => JSON.stringify(draft.value) !== JSON.stringify(original.value)
)
const { updateIdentity } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
function show(proposal: PlaceIdentityProposal = {}) {
  if (!props.place || !props.canWrite) return
  targetId.value = props.place.id
  original.value = readPlaceIdentity(props.place)
  originalSignature.value = JSON.stringify(original.value)
  draft.value = identityDraft(original.value, proposal)
  error.value = ''
  open.value = true
}
async function save() {
  if (saving.value) return
  error.value = ''
  try {
    if (!props.canWrite || !props.place || props.place.id !== targetId.value)
      throw new Error('The selected venue changed. Reopen the editor.')
    if (
      JSON.stringify(readPlaceIdentity(props.place)) !== originalSignature.value
    )
      throw new Error(
        'These details changed while you were editing. Reopen the editor.'
      )
    const patch = placeIdentityPatch(original.value, draft.value)
    if (!Object.keys(patch).length) return
    saving.value = true
    await updateIdentity(patch, { id: targetId.value })
    open.value = false
    emit('saved')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    saving.value = false
  }
}
defineExpose({ show })
</script>
