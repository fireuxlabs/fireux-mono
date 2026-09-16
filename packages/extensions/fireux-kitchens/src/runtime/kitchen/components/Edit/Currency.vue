<template>
  <UFormField label="Kitchen currency" :error="error">
    <UFieldGroup>
      <UInput v-model="draft" placeholder="CHF" maxlength="3" :disabled="!canWrite || saving" />
      <UButton label="Save" :loading="saving" :disabled="!canWrite || !changed || !valid" @click="save" />
    </UFieldGroup>
  </UFormField>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceIdentity } from '../../composables/workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'
import { readKitchenCurrency } from '../../utils/kitchen-readers'

const { selectedKitchen, kitchenId, canWrite } = useKitchenWorkspaceIdentity()
const { updateKitchen } = useKitchenUpdate()
const currency = computed(() => readKitchenCurrency(selectedKitchen.value))
const draft = ref('')
const saving = ref(false)
const error = ref('')
const value = computed(() => draft.value.trim().toUpperCase())
const valid = computed(() => /^[A-Z]{3}$/.test(value.value))
const changed = computed(() => value.value !== currency.value)
watch([kitchenId, currency], () => { draft.value = currency.value; error.value = '' }, { immediate: true })

async function save() {
  if (!canWrite.value || !valid.value || !changed.value || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await updateKitchen({ kitchenId: kitchenId.value, changes: { currency: value.value } })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Currency could not be saved.'
  } finally {
    saving.value = false
  }
}
</script>
