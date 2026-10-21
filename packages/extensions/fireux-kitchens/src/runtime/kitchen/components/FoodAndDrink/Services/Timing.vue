<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xs font-medium uppercase tracking-wide text-muted">Advance notice</h3>
      <UButton
        :label="editing ? 'Done' : 'Edit notice'"
        :aria-expanded="editing"
        size="xs"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        @click="editing = !editing"
      />
    </div>
    <p v-if="!editing" class="text-sm">{{ config.notice_hours || 0 }} hours</p>
    <UFormField v-else label="Advance notice (hours)">
    <UInput
      type="number"
      min="0"
      max="168"
      :model-value="config.notice_hours || 0"
      :disabled="disabled"
      @change="updateNotice"
    />
    </UFormField>
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { KitchenOrderTypeConfig } from '../../../models/ordering.model'
const props = defineProps<{
  config: KitchenOrderTypeConfig
  disabled?: boolean
  updateFunction: (patch: Partial<KitchenOrderTypeConfig>) => Promise<void>
}>()
const editing = ref(false)
function updateNotice(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (!value.trim()) return
  return props.updateFunction({
    notice_hours: Number(value),
  })
}
</script>
