<template>
  <UFormField label="Advance notice (hours)">
    <UInput
      type="number"
      min="0"
      max="168"
      :model-value="config.notice_hours || 0"
      :disabled="disabled"
      @change="updateNotice"
    />
  </UFormField>
</template>
<script setup lang="ts">
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
const props = defineProps<{
  config: KitchenOrderTypeConfig
  disabled?: boolean
  updateFunction: (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>
}>()
function updateNotice(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (!value.trim()) return
  return props.updateFunction({
    notice_hours: Number(value),
  })
}
</script>
