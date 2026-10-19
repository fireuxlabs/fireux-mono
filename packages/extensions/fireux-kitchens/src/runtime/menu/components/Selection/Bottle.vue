<template>
  <UFormField label="Bottle" required>
    <URadioGroup
      :model-value="modelValue"
      :items="[
        { value: 'deposit', label: `New bottle · deposit +${money(deposit)}` },
        { value: 'exchange', label: 'Exchange a bottle · no deposit' },
      ]"
      @update:model-value="select"
    />
    <p class="mt-2 text-sm text-muted">
      Exchange means returning one matching bottle for each drink.
    </p>
  </UFormField>
</template>
<script setup lang="ts">
defineProps<{
  modelValue?: 'deposit' | 'exchange'
  deposit: number
  money: (value: number) => string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: 'deposit' | 'exchange']
}>()
function select(value: unknown) {
  if (value === 'deposit' || value === 'exchange')
    emit('update:modelValue', value)
}
</script>
