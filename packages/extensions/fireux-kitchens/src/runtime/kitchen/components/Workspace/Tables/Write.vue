<template>
  <form
    class="rounded-xl border border-default p-4 sm:p-5"
    @submit.prevent="saveTableCount"
  >
    <div class="flex flex-wrap items-end gap-3">
      <UFormField
        label="Number of tables"
        description="Shared by Table service, QR Tables and POS. Tables are numbered from 1."
        :error="validationMessage || undefined"
        class="flex-1 min-w-56"
      >
        <UInput
          v-model="draftTableCount"
          type="number"
          inputmode="numeric"
          min="0"
          max="500"
          step="1"
          :disabled="saving || !canWrite"
          class="w-28"
        />
      </UFormField>
      <UButton
        type="submit"
        label="Save"
        :loading="saving"
        :disabled="!canWrite || !changed || Boolean(validationMessage)"
      />
      <span v-if="saved" role="status" class="pb-2 text-sm text-success"
        >Saved</span
      >
    </div>
    <MoleculesCopyError v-if="saveError" :message="saveError" class="mt-3" />
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenUpdate } from '../../../composables/firestore/useKitchenUpdate'
import { readKitchenTableCount } from '../../../utils/kitchen-readers'

const { kitchenId, selectedKitchen, canWrite } = useKitchenWorkspaceIdentity()
const { updateKitchen } = useKitchenUpdate()
const tableCount = computed(() => readKitchenTableCount(selectedKitchen.value))
const draftTableCount = ref('0')
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')
watch(
  [kitchenId, tableCount],
  () => {
    if (!saving.value) draftTableCount.value = String(tableCount.value)
  },
  { immediate: true }
)
watch(draftTableCount, () => {
  saved.value = false
  saveError.value = ''
})
const parsedTableCount = computed(() => Number(draftTableCount.value))
const changed = computed(() => parsedTableCount.value !== tableCount.value)
const validationMessage = computed(() =>
  String(draftTableCount.value).trim() !== '' &&
  Number.isSafeInteger(parsedTableCount.value) &&
  parsedTableCount.value >= 0 &&
  parsedTableCount.value <= 500
    ? ''
    : 'Use a whole number from 0 to 500.'
)
async function saveTableCount() {
  if (
    !canWrite.value ||
    !kitchenId.value ||
    saving.value ||
    !changed.value ||
    validationMessage.value
  )
    return
  const id = kitchenId.value
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    await updateKitchen({
      kitchenId: id,
      changes: { 'tables.count': parsedTableCount.value },
    })
    if (kitchenId.value === id) saved.value = true
  } catch (error) {
    if (kitchenId.value === id)
      saveError.value =
        error instanceof Error
          ? error.message
          : 'Could not save the number of tables.'
  } finally {
    saving.value = false
  }
}
</script>
