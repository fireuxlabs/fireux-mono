<script setup lang="ts">
type Period = 'daily' | 'weekly' | 'monthly'
const props = defineProps<{
  modelValue: Period
  range: { start: Date; end: Date }
}>()
const emit = defineEmits<{ 'update:modelValue': [Period] }>()
const options: { label: string; value: Period }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]
</script>

<template>
  <USelect
    :model-value="props.modelValue"
    :items="options"
    option-attribute="label"
    value-attribute="value"
    class="min-w-28"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
  />
</template>
