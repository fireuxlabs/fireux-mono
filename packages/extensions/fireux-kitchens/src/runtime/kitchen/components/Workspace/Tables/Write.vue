<template>
  <UCard>
    <template #header>
      <div>
        <div class="text-sm font-semibold text-highlighted">
          Numbered tables
        </div>
        <p class="m-0 text-xs text-muted">
          Creates a simple Table 1 through Table N service layout.
        </p>
      </div>
    </template>

    <form class="space-y-4" @submit.prevent="saveTableCount">
      <UFormField
        label="Number of tables"
        description="Tables are numbered from 1 up to this value."
        :error="validationMessage || undefined"
      >
        <UInput
          v-model="draftTableCount"
          type="number"
          inputmode="numeric"
          min="0"
          max="500"
          step="1"
          placeholder="0"
          :disabled="saving"
        />
      </UFormField>

      <WorkspaceFormActions
        submit-label="Save table count"
        cancel-to="/workspace/kitchen/tables"
        :status="saveMessage"
        :loading="saving"
        :disabled="Boolean(validationMessage)"
      />
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceTables } from '../../../composables/workspace/Tables/useKitchenWorkspaceTables'
import { useKitchenUpdate } from '../../../composables/firestore/mutations/useKitchenUpdate'

const { kitchenId, rootCollection, databaseId, tableCount, canWrite } =
  useKitchenWorkspaceTables()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()
const draftTableCount = ref('0')
const saving = ref(false)
const saveMessage = ref('')

watch(
  tableCount,
  (count: number) => {
    if (!saving.value) draftTableCount.value = String(count)
  },
  { immediate: true }
)

const parsedTableCount = computed(() => Number(draftTableCount.value))
const validationMessage = computed(() =>
  Number.isSafeInteger(parsedTableCount.value) &&
  parsedTableCount.value >= 0 &&
  parsedTableCount.value <= 500
    ? ''
    : 'Use a whole number from 0 to 500.'
)

const saveTableCount = async () => {
  if (!canWrite.value || !kitchenId.value || !rootCollection.value) {
    throw new Error('Select a writable kitchen before configuring tables.')
  }
  if (validationMessage.value || saving.value) return

  saving.value = true
  saveMessage.value = ''
  try {
    await updateKitchen({
      kitchenId: kitchenId.value,
      changes: { 'tables.count': parsedTableCount.value },
    })
    saveMessage.value = 'Saved'
    toast.add({
      title: 'Table count updated',
      icon: 'i-heroicons-check-circle',
    })
    return 'success'
  } catch (error) {
    saveMessage.value = 'Save failed'
    toast.add({
      title: 'Failed to update table count',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  } finally {
    saving.value = false
  }
}
</script>
