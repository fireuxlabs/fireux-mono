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
    <template #body><KitchenPrepAndProductionStationsCreate /></template>
  </UModal>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceStations } from '../../../composables/workspace/stations/useKitchenWorkspaceStations'
const { createOpen, canWrite } = useKitchenWorkspaceStations()
</script>
