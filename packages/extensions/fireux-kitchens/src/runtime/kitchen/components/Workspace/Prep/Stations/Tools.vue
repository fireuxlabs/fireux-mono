<template>
  <UButton
    label="Create Station"
    icon="i-lucide-plus"
    :disabled="!canWrite"
    @click="createOpen = true"
  />
  <UModal
    v-model:open="createOpen"
    title="Add station"
    description="Create a production destination for the selected Kitchen."
  >
    <template #body><KitchenWorkspacePrepStationsCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import KitchenWorkspacePrepStationsCreate from './Create/Index.vue'
import { useKitchenWorkspacePrepStationsRead } from '../../../../composables/workspace/prep/stations/read'
const { createOpen, canWrite } = useKitchenWorkspacePrepStationsRead()
</script>
