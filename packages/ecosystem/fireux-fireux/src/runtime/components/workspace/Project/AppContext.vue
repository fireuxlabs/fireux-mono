<template>
  <UCard>
    <template #header
      ><div class="flex justify-between gap-3">
        <h2 class="text-lg font-semibold">Connected App</h2>
        <UButton
          label="Refresh"
          color="neutral"
          variant="ghost"
          :loading="pending"
          @click="refresh"
        /></div
    ></template>
    <p v-if="pending" class="text-muted">Loading public context…</p>
    <div v-else-if="message">
      <p class="text-muted select-text">{{ message }}</p>
      <MoleculesCopyError :message="message" />
    </div>
    <div v-else-if="data" class="space-y-3">
      <div class="flex gap-3 items-center">
        <h3 class="font-semibold">Misebox App</h3>
        <UBadge color="neutral" variant="soft">Public</UBadge>
      </div>
      <p class="whitespace-pre-line">{{ data.context.summary }}</p>
      <UButton
        to="https://misebox.app"
        target="_blank"
        label="Open Misebox"
        icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="soft"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { watchEffect } from 'vue'
import { useProjectAppContext } from '../../../project/composables/workspace/identity/useProjectAppContext'
const { data, pending, message, refresh } = useProjectAppContext()
const emit = defineEmits<{
  state: [value: { data: typeof data.value; pending: boolean; message: string }]
}>()
watchEffect(() =>
  emit('state', {
    data: data.value,
    pending: pending.value,
    message: message.value,
  })
)
</script>
