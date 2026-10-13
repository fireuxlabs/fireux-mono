<template>
  <URadioGroup
    :model-value="value"
    :items="radioItems"
    :disabled="disabled"
    :aria-label="label"
    variant="table"
    orientation="horizontal"
    indicator="hidden"
    :ui="{
      fieldset: 'inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-elevated p-1',
      item: 'min-w-0 rounded-lg border-0 px-4 py-2 transition-colors has-[[data-state=checked]]:bg-default has-[[data-state=checked]]:shadow-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary motion-reduce:transition-none',
      label: 'font-medium',
      container: 'sr-only',
    }"
    @update:model-value="select"
  />
</template>
<script setup lang="ts" generic="T extends string">
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  label: string
  items: { label: string; value: T; disabled?: boolean }[]
  disabled?: boolean
}>(), { disabled: false })
const model = defineModel<T>({ required: true })
const value = computed<string>(() => model.value)
const radioItems = computed<{ label: string; value: string; disabled?: boolean }[]>(() => props.items)
function select(value: unknown) {
  if (props.disabled) return
  const item = props.items.find((item) => item.value === value && !item.disabled)
  if (item) model.value = item.value
}
</script>
