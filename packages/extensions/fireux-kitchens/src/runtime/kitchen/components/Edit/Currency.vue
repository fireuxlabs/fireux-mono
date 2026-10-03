<template>
  <MoleculesFormsEditableSimpleField
    :key="kitchenId"
    :capture-intent="captureIntent"
    label="Currency"
    :value="currency"
    placeholder="CHF"
    :maxlength="3"
    :disabled="!canWrite"
    :formatting-function="formatCurrency"
    :validation-function="validateCurrency"
    :update="save"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIdentity } from '../../composables/workspace/identity/useKitchenWorkspaceIdentity'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'
import { readKitchenCurrency } from '../../utils/kitchen-readers'

const { selectedKitchen, kitchenId, canWrite } = useKitchenWorkspaceIdentity()
const { updateKitchen, captureIntent } = useKitchenUpdate([kitchenId])
const currency = computed(() => readKitchenCurrency(selectedKitchen.value))
const formatCurrency = (value: string) => value.trim().toUpperCase()
const validateCurrency = (value: string) => ({
  isValid: /^[A-Z]{3}$/.test(formatCurrency(value)),
  message: 'Use a three-letter currency code, such as CHF.',
})
async function save(value: string) {
  if (!canWrite.value)
    throw new Error('Editing requires access to this Kitchen.')
  const next = formatCurrency(value)
  if (!validateCurrency(next).isValid)
    throw new Error('Use a three-letter currency code, such as CHF.')
  await updateKitchen({
    kitchenId: kitchenId.value,
    changes: { currency: next },
  })
}
</script>
