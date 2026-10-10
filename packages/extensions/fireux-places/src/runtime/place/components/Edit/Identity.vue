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
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
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
const editorLifetime = ref(0)
const dirty = computed(
  () => JSON.stringify(draft.value) !== JSON.stringify(original.value)
)
const { currentUser } = useAuth()
const { updateIdentity, captureIntent } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
const captureSurfaceIntent = useCommandScope([
  editorLifetime,
  open,
  () => JSON.stringify(draft.value),
])
function resetEditor() {
  editorLifetime.value++
  open.value = false
  saving.value = false
  error.value = ''
  targetId.value = ''
  original.value = readPlaceIdentity(null)
  draft.value = readPlaceIdentity(null)
  originalSignature.value = ''
}
watch(
  [
    () => currentUser.value?.uid,
    () => props.place?.id,
    () => props.canWrite,
    () => JSON.stringify(props.mutationAuthority),
  ],
  resetEditor,
  { flush: 'sync' }
)
onScopeDispose(resetEditor, true)
function show(proposal: PlaceIdentityProposal = {}) {
  if (!props.place || !props.canWrite) return
  editorLifetime.value++
  targetId.value = props.place.id
  original.value = readPlaceIdentity(props.place)
  originalSignature.value = JSON.stringify(original.value)
  draft.value = identityDraft(original.value, proposal)
  saving.value = false
  error.value = ''
  open.value = true
}
async function save() {
  if (saving.value || !open.value) return
  const ownerCurrent = captureIntent()
  const surfaceCurrent = captureSurfaceIntent()
  const isCurrent = () => ownerCurrent() && surfaceCurrent()
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
    if (!isCurrent()) return
    saving.value = false
    open.value = false
    emit('saved')
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : 'Try again.'
  } finally {
    if (isCurrent()) saving.value = false
  }
}
defineExpose({ show })
</script>
